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
    let vote = await Vote.findOne({
      user_id: userId,
      video_req_id: videoReqId
    });
    if (vote) {
      return {
        voted: true
      };
    }
    const oldRequest = await VideoRequest.findById({ _id: videoReqId });
    const other_type = vote_type === 'ups' ? 'downs' : 'ups';
    vote = new Vote({
      user_id: userId,
      video_req_id: videoReqId
    });
    await vote.save();
    return VideoRequest.findByIdAndUpdate(
      { _id: videoReqId },
      {
        votes: {
          [vote_type]: ++oldRequest.votes[vote_type],
          [other_type]: oldRequest.votes[other_type],
        },
      },
      {new: true}
    );
  },

  deleteRequest: (id) => {
    return VideoRequest.deleteOne({ _id: id });
  },
};
