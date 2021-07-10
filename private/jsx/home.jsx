"use strict";

//HELPER FUNCTIONS
function getMinutes(){
  return ("0" + (new Date()).getMinutes()).slice(-2);
}

function getHours(){
  return ("0" + (new Date()).getHours()).slice(-2);
}

function getGreeting(name){
  let greeting;
  let hour = (new Date).getHours();
  if(hour < 6){
    greeting = "夜更かしは肌に悪いぞ！";
  } else if(hour < 12){
    greeting = `おはようございます、${name}様。`;
  } else if(hour < 18){
    greeting = `こんにちは、${name}様。`;
  } else{
    greeting = `こんばんは、${name}様。`;
  }
  return greeting;
}

function updateTime(){
  document.getElementById("hour").textContent = getHours();
  document.getElementById("minute").textContent = getMinutes();
}

//REACT COMPONENTS AND CLASSES
function Nav(props){

    return (
      <div id="nav">
      </div>
    );
}

function Greeting(props){
  
  // Ask for name
  if(props.name == undefined){

    return (
      <div className="greeting">
        <h1 id="name-greet" className="japanese">どう呼べばよろしいでしょうか。</h1>
        <form id="name-entry" onSubmit={ (e) => {
          let username = document.getElementById("name-input").value;
          chrome.storage.local.set({"name":username});
          props.page.setState({name:username});
          console.log("Name should be set to", username);
          e.preventDefault();
          return false; 
          }
        }>
          <input id="name-input" type="text" required></input>
        </form>
      </div>
    )

  } else {
    
    setInterval(updateTime, 1000);

    return (
      <div className="greeting">
        <h1 id="time"><span id="hour">{getHours()}</span>:<span id="minute">{getMinutes()}</span></h1>
        <h1 id="time-greeting" className="japanese">{getGreeting(props.name)}</h1>
      </div>
    )
  }

  

}

function Footer({imgid}){

  let keyHandler = function () {

    let textContent = document.getElementById("search-input").value;

    if(textContent == "" || textContent == undefined){
      console.log("Input empty.");
      document.getElementById("search").classList.remove("contains-text");
    } else {
      console.log("Input text:", textContent)
      document.getElementById("search").classList.add("contains-text");
    }

  }

  return(

    <div id="footer">
      <form action="https://www.google.com/search" id="search" className="search" method="get" name="searchform">
        <i id="search-icon" className="fa fa-search"/>
        <input id="search-input" type="text" name="q" onKeyUp={keyHandler} required/>
      </form>
      <div id="redditlink">
        <a href={"https://www.reddit.com/r/moescape/"+imgid}>
          <img src="https://www.reddit.com/favicon.ico"></img>
        </a>
      </div>
    </div>

  );

}

class Page extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      loading: true,
      imgid: null,
      name: undefined,
    }

  }

  componentDidMount(){

    let page = this;

    page.getRedditPage();
    page.getName();

  }

  getRedditPage(){

    let page = this;

    let parseRedditPage = function(json){
      let posts = json.data.children;
      console.log(posts);

      let scores = [];
      for(let i = 0; i < posts.length; i++){
        let post = posts[i].data;
        if(post.preview == undefined){
          continue;
        }
        let width = post.preview.images[0].source.width;
        let height = post.preview.images[0].source.height;
        let score = Math.sqrt(width * height) * Math.pow(1 / (1 + (Math.abs( (16/9) - width/height ))), 2);
        console.log("Score for index " + i + ": " + score)
        scores[i] = score;
      }

      let indeces = [...Array(scores.length).keys()]
      console.log(indeces);
      console.log(scores);

      //Sort but have largest first
      for(let i = 1; i < scores.length; i++){

        for(let j = i; j > 0; j--){

          if(scores[j] > scores[j-1]){
            let temp = scores[j];
            scores[j] = scores[j-1];
            scores[j-1] = temp;

            temp = indeces[j]
            indeces[j] = indeces[j-1];
            indeces[j-1] = temp;
          }

        }

      }

      //Handle the case for bad image requests.
      let i = 0;
      let img = document.getElementById("wallpaper-img");
      let errorHandler = function () {
        let url = posts[indeces[++i]].data.url;
        console.log("Failed to load image, loading next url:", url)
        img.src = url;
      }

      //Remove listeners on load. Process any extra data here
      let loadHandler = function () {
        img.removeEventListener('error', errorHandler);
        img.removeEventListener('load', loadHandler);
        console.log("Image loaded, removing listeners.");
        page.setState({loading:false, imgid:posts[indeces[i]].data.id});
        console.log(page.state);
        setTimeout(function(){
          document.getElementById("load").style.display = "none";
          console.log("Setting display to none.")
        }, 1000)
      }

      img.addEventListener('error', errorHandler);
      img.addEventListener('load', loadHandler)
      img.src = posts[indeces[i]].data.url;

    }

    let url = 'https://www.reddit.com/r/Moescape/top/.json?sort=wee&t=day'
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);

    xhr.onload = function() {

      let json = JSON.parse(xhr.responseText);
      if(json.error == 1){
        alert("Had an issue grabbing reddit data: " + json.message);
      } else {
        parseRedditPage(json);
      }
    }

    xhr.onerror = function () {
      console.log("Tried to request " + url + " but got an error instead.");
    };

    console.log("querying: " + url);
    xhr.send();
  }

  getName(){

    let page = this;
    chrome.storage.local.get("name", (items) => {
      page.setState({name:items.name});
      console.log("Loaded name:", items.name);
    });
  
  }

  render(){

    return (
      <React.Fragment>
        <div id="main">
          <div id="wallpaper">
            <img id="wallpaper-img"/>
          </div>
          <Nav/>
          <Greeting name={this.state.name} page={this}/>
          <Footer imgid={this.state.imgid}/>
        </div>

        <div id="load" style={{opacity:(this.state.loading? "1":"0")}}>
          <img id="load-gif" src="public/assets/images/dance.gif"/>
          <h1> Loading </h1>
        </div>
      </React.Fragment>
    );
  }

}

ReactDOM.render(<Page />, document.getElementById('react'));
