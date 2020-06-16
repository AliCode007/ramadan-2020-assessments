var mongoose = require('./mongo.config');

if (!Object.keys(mongoose).length) return;

var VotesSchema = mongoose.Schema(
  {
      user_id: mongoose.ObjectId,
      video_req_id: mongoose.ObjectId
      
}
);

var votesModel = mongoose.model('Votes', VotesSchema);
module.exports = votesModel;
