const VideoRequest = require('./../models/video-requests.model');
const User = require('./../models/user.model');
const Vote = require('./../models/votes.model');

module.exports = {
  createRequest: async (vidRequestData) => {
    author_id = vidRequestData.author_id;
    let user = await User.findById(author_id);
    vidRequestData.author_name = user.author_name;
    vidRequestData.author_email = user.author_email;
    let newRequest = new VideoRequest(vidRequestData);
    return newRequest.save();
  },

  getAllVideoRequests: async (sort) => {
    return VideoRequest.find({}).sort({ submit_date: '-1' });

  },

  searchRequests: (topic) => {
    return VideoRequest.find({ topic_title: { $regex : topic, $options : 'i'} })
      .sort({ addedAt: '-1' })
  },

  getRequestById: (id) => {
    return VideoRequest.findById({ _id: id });
  },

  updateRequest: (id, status, resVideo) => {
    const updates = {
      status: status,
      video_ref: {
        link: resVideo,
        date: resVideo && new Date(),
      },
    };

    return VideoRequest.findByIdAndUpdate(id, updates, { new: true });
  },

  updateVoteForRequest: async (videoReqId,userId, vote_type) => {
    const oldRequest = await VideoRequest.findById({ _id: videoReqId });
    const other_type = vote_type === 'ups' ? 'downs' : 'ups';

    if (oldRequest.votes[vote_type].includes(userId)) {
      return {
        voted: true
      }
    }

    if (oldRequest.votes[other_type].includes(userId)){
      const index = oldRequest.votes[other_type].indexOf(userId);
      if (index > -1) {
        oldRequest.votes[other_type].splice(index, 1);
      }
    }

    oldRequest.votes[vote_type].push(userId);
    oldRequest.save();
    return oldRequest;
  },

  deleteRequest: (id) => {
    return VideoRequest.deleteOne({ _id: id });
  },
};
