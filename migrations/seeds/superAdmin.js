const dayjs = require('dayjs');
const ObjectId = require('mongoose').Types.ObjectId;

const accountId = [new ObjectId('631f5ed70cf3d8d5817f021a'), new ObjectId('631f5ed70cf2d7d5814f121a')],
profileId = [new ObjectId('622af0006bc5509231ae69f7'), new ObjectId('622af0006bc4419123ae89f6')];

const account = [{
 _id: accountId[0],
 passwordArchived: [],
 email: "remilekunelijah@outlook.com",
 password: "$2b$10$mmu7N4ArkHE5py7T8weyqO.YiW/p7Sv/odgOm8arZ/.ypUWSiHFqm", // superAdmin@1
 role: 0,
 status: "active",
 isEnabled: true,
 lastLogin: dayjs(new Date()).format("YYYY-MM-DD HH:mm"),
 createdAt: "2020-04-08T19:07:36.000Z",
 updatedAt: "2020-04-08T19:07:36.000Z",
},
{
  _id: accountId[1],
  passwordArchived: [],
  email: "marcusparker563@gmail.com",
  password: "$2b$10$mmu7N4ArkHE5py7T8weyqO.YiW/p7Sv/odgOm8arZ/.ypUWSiHFqm", // superAdmin@1
  role: 0,
  status: "active",
  isEnabled: true,
  lastLogin: dayjs(new Date()).format("YYYY-MM-DD HH:mm"),
  createdAt: "2020-04-08T19:07:36.000Z",
  updatedAt: "2020-04-08T19:07:36.000Z",
 }]


const profile = [{
 _id: profileId[0],
 user: accountId[0], 
 number: "+2349032521166",
 email: "remilekunelijah@outlook.com",
 firstName: "Remilekun",
 lastName: "Elijah",
 country: "Nigeria",
 state: "Lagos",
 skillset: ["NODEJS", "EXPRESSJS", "MONGODB", "POSTGRESQL", "EJS"],
 experienceLevel: "Expert",
 avatar: "https://res.cloudinary.com/remilekunelijah/image/upload/v1649448174/personal/avatar_pic.png",
 coverImage: "https://res.cloudinary.com/remilekunelijah/image/upload/v1648212327/Learno/techchak.jpg",
 createdAt: "2020-04-08T19:07:36.000Z",
 updatedAt: "2020-04-08T19:07:36.000Z",
},
{
  _id: profileId[1],
  user: accountId[1], 
  number: "+2347033500778",
  email: "marcusparker563@gmail.com",
  firstName: "Marcus",
  lastName: "Gallant",
  userName: 'Marcus',
  country: "Nigeria",
  state: "Lagos",
  experienceLevel: "Expert",
  avatar: "https://res.cloudinary.com/remilekunelijah/image/upload/v1649448174/personal/avatar_pic.png",
  coverImage: "https://res.cloudinary.com/remilekunelijah/image/upload/v1648212327/Learno/techchak.jpg",
  createdAt: "2020-04-08T19:07:36.000Z",
  updatedAt: "2020-04-08T19:07:36.000Z",
 }]

const portfolio =  {
  _id: new ObjectId(),
  user: profileId,
  totalProjectCreated: 5,
  totalProjectCompleted: 0,
  roadmap: [],
  personal: [],
  myTeam: [],
  capstone: [],
  team: [],
  createdAt: "2022-04-18T04:37:54.270Z",
  updatedAt: "2022-04-18T04:37:54.270Z"
 };
 

module.exports = {
  account,
  profile,
  portfolio
}