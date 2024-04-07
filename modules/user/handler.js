'use strict';
const s3Upload = require('../../utils/file_upload/s3UploadAdaptor'),
  s3 = require('../../utils/file_upload/s3UploadAdapt'),
  ApiResponse = require('../../utils/http.response');

const {
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_OK,
  HTTP_NOT_FOUND,
} = require('../../utils/http.response.code');
const {
  UPLOAD_DENIED,
  AVATAR_UPLOADED,
  ACCOUNT_NOT_FOUND,
} = require('../../utils/http.response.message');

const AccountService = require('../../services/account.service');
const ProfileService = require('../../services/profile.service');
const SYSTEM = require('../../services/system.service');
const Bank = require('../../services/bank.service');
const NotiificationService = require('../../services/notification.service');


exports.getLoggedInUser = async (locals) => {
  const {
    pid,
    id,
    role
  } = locals;
  const account = await AccountService.getAccountById(id);
  const profile = await ProfileService.getProfileByAccountId({
    user: id,
    role,
  });

  if (profile) {
    profile.bank = await (await Bank.retrieve(profile._id)).data
    profile.activities = await (await NotiificationService.getActivity(pid))
  }
  // if(role === 1) {
    profile.totalInvested = await Bank.getTotalInvested();
  // }
  account.data = profile;
  return account;
};

exports.getUserById = async (req) => {
  const {
    id
  } = req.params;
  let {
    filter
  } = req.query;

  if (filter) {
    const dataRequested = filter.split(',');
    // ensures password related request doesn't come in
    filter = dataRequested.filter((item) => {
      return item != 'password' && item != 'passwordArchived';
    });
  }

  const account = await AccountService.getAccountById(id, filter);

  if (account.data) {
    const profile = await ProfileService.getProfileByAccountId({
      user: id,
      role: account.data.role,
    });

    account.data = profile;

    return account;
  } else throw ApiResponse.gen(HTTP_NOT_FOUND, ACCOUNT_NOT_FOUND);
};

exports.getAllUsersActivities = async () => {
  const activities = await NotiificationService.getAllActivities();
  return ApiResponse.gen(HTTP_OK, 'Activities retrieved successfully', activities);
}

exports.deleteUserById = async (id) => {
  const account = await AccountService.deleteAccount(id);

  // digest deleted users accounts id
  await SYSTEM.digest(account.data._id);

  delete account.data;
  // deletes all users data
  SYSTEM.ejectUser();
  return account;
};

exports.uploadImage = async ({
  id,
  role,
  pid
}, body) => {
  try {
    // const tempFilePath = path.resolve("uploads/tmp"),
    //   fileName = tempFilePath.concat('/removebg.png');
    //   const { department } = await ProfileService.getProfileByAccountId({user: id, filter: "department"});

    // if (role === FELLOW) {
    //   const result = await new REMOVEBG({
    //     uploadType: "base64",
    //     bgColor: ColorUtil.getByDepartment(department),
    //   }).removeBackground(body.file, fileName);

    //   if (result) {
    //     body.file = "data:image/png;base64,\n"+fs.readFileSync(path.resolve(fileName), 'base64');
    //   }
    // }
    const pImg = await s3Upload({
      folder: 'profile',
      file: body.file,
    });
    const avat = await ProfileService.updateAvatar(id, pImg);
    return ApiResponse.gen(HTTP_OK, AVATAR_UPLOADED, avat);
  } catch (err) {
    if (err.code) throw err;
    throw ApiResponse.gen(HTTP_INTERNAL_SERVER_ERROR, UPLOAD_DENIED);
  }
};

exports.getAllUsers = async (body) => {
  if (body.offset) {
    body.skip = parseInt(body.offset);
    delete body.offset;
  } else {
    body.skip = 0;
  }

  const users = await AccountService.getAllUsers(body);
  return users;
};

exports.toggleUserApproval = async (id) => {
  const data = await AccountService.toggleUserApproval(id);
  return data;
};

exports.getActiveUsers = (query) => {
  const result = AccountService.getActiveUsers(query);
  return result;
};