let state = {
   searchTerm: "",
   sortBy: "newFirst",
   userId: ""

}


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
      <button  class="btn btn-link"  >🔺</button>
      <h3 class="votes-num">${videoReq.votes.ups.length - videoReq.votes.downs.length} </h3>
      <button  class="btn btn-link" >🔻</button>
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
    <p>
  </div>`;

  buttonsElms = videoReqElm.getElementsByClassName('btn-link');

  if (videoReq.votes.ups.includes(state.userId)){
    buttonsElms[0].style.opacity="0.5";
  }
  if (videoReq.votes.downs.includes(state.userId)){
    buttonsElms[1].style.opacity="0.5";
  }

  buttonsElms[0].addEventListener('click',function(){
    res = updateVotes(videoReq._id,true).then((res ) => {
      voted = res.voted;
      if (!voted) {
        votesElm = document.getElementById(videoReq._id).getElementsByClassName('votes-num')[0];
        votesElm.innerHTML = res.votes.ups.length - res.votes.downs.length;
        buttonsElms = document.getElementById( videoReq._id).getElementsByClassName('btn-link');
        buttonsElms[0].style.opacity="0.5";
        buttonsElms[1].style.opacity="1";

      } 
    });
  });
  buttonsElms[1].addEventListener('click',function(){
    res = updateVotes(videoReq._id,false).then((res ) => {
      voted = res.voted;
      if (!voted) {
        votesElm = document.getElementById(videoReq._id).getElementsByClassName('votes-num')[0];
        votesElm.innerHTML = res.votes.ups.length - res.votes.downs.length;
        buttonsElms = document.getElementById( videoReq._id).getElementsByClassName('btn-link');
        buttonsElms[1].style.opacity="0.5";
        buttonsElms[0].style.opacity="1";
      } 
    });

  });

  return videoReqElm;

  

}

function  updateVotes(videoReqId,flag){

  let headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');

  if(flag){
      data = {
          videoReqId: videoReqId,
          userId: state.userId,
          vote_type: "ups"
      }
  }else {
      data = {
          videoReqId: videoReqId,
          userId: state.userId,
          vote_type: "downs"
      }
  }

  return fetch("http://localhost:7777/video-request/vote",{
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(data) 
  })
  .then(blob => blob.json())
  .then((res) => {
      return res;
  });



}

function validateFormData(data){
  let valid = true;
  let { topic_title,topic_details } = data;



  if (!topic_title || (topic_title.length > 100) ) {
    document.getElementById('topic_title').classList.add('is-invalid');
    valid = false;
  }

  if (!topic_details){
    document.getElementById('topic_details').classList.add('is-invalid');
    valid = false;
  }
  return valid;
}

function postVideoRequest(e){
    e.preventDefault();

    const formVideoReqElm = document.getElementById('form-video-request');
    const formData = new FormData(formVideoReqElm);
    formData.append('author_id',state.userId);
    const data = {}
    formData.forEach(function(value,key){
        data[key] = value;
    })
  

    if (!validateFormData(data)) return ;
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


const debounce = (fn, time) => {
  let timeout;

  return function() {
    const functionCall = () => fn.apply(this, arguments);
    
    clearTimeout(timeout);
    timeout = setTimeout(functionCall, time);
  }
}


document.addEventListener('DOMContentLoaded',function() {
    const fromVidReqElm = document.getElementById('form-video-request');
    const sortByElms = document.querySelectorAll('[id*=sort_by_]');
    const searchBoxElm = document.getElementById('search_box');
    const formInputElms = fromVidReqElm.querySelectorAll('input , textarea');

    if (window.location.search) {
      state.userId = new URLSearchParams(window.location.search).get('id');
      if (state.userId) {
        document.querySelector('.login-form').classList.add('d-none');
        document.querySelector('.app-content').classList.remove('d-none');
      }
    }

    loadVidReqs();

    formInputElms.forEach((elm) => {
      elm.addEventListener('focus',function(e) {
        this.classList.remove('is-invalid')
      });
    });
    fromVidReqElm.addEventListener('submit',postVideoRequest);
    searchBoxElm.addEventListener('input',debounce(function(e) {
      state.searchTerm = searchBoxElm.value;
      if (document.getElementById('sort_by_top').classList.contains('active')){
        state.sortBy = "topVotedFirst";
      }else{
        state.sortBy = "newFirst"
      }
      loadVidReqs(state.sortBy,state.searchTerm);
    },300));

    sortByElms.forEach((elm) => {
      elm.addEventListener('click', function (e) {
        e.preventDefault();

        state.sortBy = this.querySelector('input').value;
        state.searchTerm = document.getElementById('search_box').value;
        loadVidReqs(state.sortBy,state.searchTerm);

        this.classList.add('active');
        if (state.sortBy === 'topVotedFirst'){
          document.getElementById('sort_by_new').classList.remove('active');
        }else{
          document.getElementById('sort_by_top').classList.remove('active');
        }
      })
    })

});

