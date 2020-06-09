function createVideoReqElm(videoReq){

  videoReqElm = document.createElement('div');
  videoReqElm.id = videoReq._id;
  videoReqElm.className = "card mb-3";
  videoReqElm.innerHTML= `
  <div class="card-body d-flex justify-content-between flex-row">
    <div class="d-flex flex-column">
      <h3>${videoReq.topic_title}</h3>
      <p class="text-muted mb-2">${videoReq.topic_details}</p>
      <p class="mb-0 text-muted">
        ${videoReq.expected_result && `<strong>Expected results:</strong> ${videoReq.expected_result}`}
      </p>
    </div>
    <div class="d-flex flex-column text-center">
      <button  class="btn btn-link" ">🔺</button>
      <h3 class="votes-num">${videoReq.votes.ups - videoReq.votes.downs} </h3>
      <button  class="btn btn-link" ">🔻</button>
    </div>
  </div>
  <div class="card-footer d-flex flex-row justify-content-between">
    <div>
      <span class="text-info">${videoReq.status.toUpperCase()}</span>
      &bullet; added by <strong>${videoReq.author_name}</strong> on
      <strong>${new Date(videoReq.submit_date).toLocaleDateString()}</strong>
    </div>
    <div
      class="d-flex justify-content-center flex-column 408ml-auto mr-2"
    >
      <div class="badge badge-success">
        ${videoReq.target_level}
      </div>
    </div>
  </div>`;
  buttons = videoReqElm.getElementsByClassName('btn-link');
  buttons[0].addEventListener('click',function(){
    updateVotes(videoReq._id,true);
    votesElm = document.getElementById(videoReq._id).getElementsByClassName('votes-num')[0];
    console.log(votesElm);
    votesElm.innerHTML = `${parseFloat(votesElm.innerHTML) + 1}`;
  });
  buttons[1].addEventListener('click',function(){
    updateVotes(videoReq._id,false);
    votesElm = document.getElementById(videoReq._id).getElementsByClassName('votes-num')[0];
    votesElm.innerHTML = parseFloat(votesElm.innerHTML) - 1;
  });

  return videoReqElm;

  

}

function updateVotes(id,flag){

  let headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');

  if(flag){
      data = {
          id: id,
          vote_type: "ups"
      }
  }else {
      data = {
          id: id,
          vote_type: "downs"
      }
  }

  fetch("http://localhost:7777/video-request/vote",{
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(data) 
  });



}

function postVideoRequest(e){
    e.preventDefault();

    const formVideoRequest = document.getElementById('form-video-request');
    const formData = new FormData(formVideoRequest);
    const data = {}
    formData.forEach(function(value,key){
        data[key] = value;
    })

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');

    fetch("http://localhost:7777/video-request",{
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data) 
    })
    .then(blob => blob.json())
    .then((res) => {
        console.log(res);
        document.getElementById('video-request-list').prepend(createVideoReqElm(res));
    });

}



function loadVidReqs(sort="newFirst",searchTerm="") {

    let url = `http://localhost:7777/video-request?sortBy=${sort}`;

    if (searchTerm) {
      url = `${url}&searchTerm=${searchTerm}`;
    }
    
    fetch(url)
    .then(blob => blob.json())
    .then((requests)=> {
        document.getElementById('video-request-list').innerHTML = "";
        requests.forEach((request)=> {
            document.getElementById('video-request-list').appendChild(createVideoReqElm(request));

        });

    });
}



document.addEventListener('DOMContentLoaded',function() {
    const fromVidReqElm = document.getElementById('form-video-request');
    const sortByElms = document.querySelectorAll('[id*=sort_by_]');
    const searchBoxElm = document.getElementById('search_box');
    
    loadVidReqs();

    fromVidReqElm.addEventListener('submit',postVideoRequest);
    searchBoxElm.addEventListener('input',function(e) {
      let searchTerm = searchBoxElm.value;
      let sortBy;
      if (document.getElementById('sort_by_top').classList.contains('active')){
        sortBy = "topVotedFirst";
      }else{
        sortBy = "newFirst"
      }
      loadVidReqs(sortBy,searchTerm);
    });

    sortByElms.forEach((elm) => {
      elm.addEventListener('click', function (e) {
        e.preventDefault();

        let sortBy = this.querySelector('input').value;
        let searchTerm = document.getElementById('search_box').value;
        loadVidReqs(sortBy,searchTerm);

        this.classList.add('active');
        if (sortBy === 'topVotedFirst'){
          document.getElementById('sort_by_new').classList.remove('active');
        }else{
          document.getElementById('sort_by_top').classList.remove('active');
        }
      })
    })

});

