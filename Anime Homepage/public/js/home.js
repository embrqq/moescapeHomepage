"use strict";

//HELPER FUNCTIONS

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function getMinutes() {
  return ("0" + new Date().getMinutes()).slice(-2);
}

function getHours() {
  return ("0" + new Date().getHours()).slice(-2);
}

function getGreeting(name) {
  var greeting = void 0;
  var hour = new Date().getHours();
  if (hour < 6) {
    greeting = "夜更かしは肌に悪いぞ！";
  } else if (hour < 12) {
    greeting = "\u304A\u306F\u3088\u3046\u3054\u3056\u3044\u307E\u3059\u3001" + name + "\u69D8\u3002";
  } else if (hour < 18) {
    greeting = "\u3053\u3093\u306B\u3061\u306F\u3001" + name + "\u69D8\u3002";
  } else {
    greeting = "\u3053\u3093\u3070\u3093\u306F\u3001" + name + "\u69D8\u3002";
  }
  return greeting;
}

function updateTime() {
  document.getElementById("hour").textContent = getHours();
  document.getElementById("minute").textContent = getMinutes();
}

//REACT COMPONENTS AND CLASSES
function Nav(props) {

  return React.createElement("div", { id: "nav" });
}

function Greeting(props) {

  // Ask for name
  if (props.name == undefined) {

    return React.createElement(
      "div",
      { className: "greeting" },
      React.createElement(
        "h1",
        { id: "name-greet", className: "japanese" },
        "\u3069\u3046\u547C\u3079\u3070\u3088\u308D\u3057\u3044\u3067\u3057\u3087\u3046\u304B\u3002"
      ),
      React.createElement(
        "form",
        { id: "name-entry", onSubmit: function onSubmit(e) {
            var username = document.getElementById("name-input").value;
            chrome.storage.local.set({ "name": username });
            props.page.setState({ name: username });
            console.log("Name should be set to", username);
            e.preventDefault();
            return false;
          } },
        React.createElement("input", { id: "name-input", type: "text", required: true })
      )
    );
  } else {

    setInterval(updateTime, 1000);

    return React.createElement(
      "div",
      { className: "greeting" },
      React.createElement(
        "h1",
        { id: "time" },
        React.createElement(
          "span",
          { id: "hour" },
          getHours()
        ),
        ":",
        React.createElement(
          "span",
          { id: "minute" },
          getMinutes()
        )
      ),
      React.createElement(
        "h1",
        { id: "time-greeting", className: "japanese" },
        getGreeting(props.name)
      )
    );
  }
}

function Footer(_ref) {
  var imgid = _ref.imgid;


  var keyHandler = function keyHandler() {

    var textContent = document.getElementById("search-input").value;

    if (textContent == "" || textContent == undefined) {
      console.log("Input empty.");
      document.getElementById("search").classList.remove("contains-text");
    } else {
      console.log("Input text:", textContent);
      document.getElementById("search").classList.add("contains-text");
    }
  };

  return React.createElement(
    "div",
    { id: "footer" },
    React.createElement(
      "form",
      { action: "https://www.google.com/search", id: "search", className: "search", method: "get", name: "searchform" },
      React.createElement("i", { id: "search-icon", className: "fa fa-search" }),
      React.createElement("input", { id: "search-input", type: "text", name: "q", onKeyUp: keyHandler, required: true })
    ),
    React.createElement(
      "div",
      { id: "redditlink" },
      React.createElement(
        "a",
        { href: "https://www.reddit.com/r/moescape/" + imgid },
        React.createElement("img", { src: "https://www.reddit.com/favicon.ico" })
      )
    )
  );
}

var Page = function (_React$Component) {
  _inherits(Page, _React$Component);

  function Page(props) {
    _classCallCheck(this, Page);

    var _this = _possibleConstructorReturn(this, (Page.__proto__ || Object.getPrototypeOf(Page)).call(this, props));

    _this.state = {
      loading: true,
      imgid: null,
      name: undefined
    };

    return _this;
  }

  _createClass(Page, [{
    key: "componentDidMount",
    value: function componentDidMount() {

      var page = this;

      page.getRedditPage();
      page.getName();
    }
  }, {
    key: "getRedditPage",
    value: function getRedditPage() {

      var page = this;

      var parseRedditPage = function parseRedditPage(json) {
        var posts = json.data.children;
        console.log(posts);

        var scores = [];
        for (var _i = 0; _i < posts.length; _i++) {
          var post = posts[_i].data;
          if (post.preview == undefined) {
            continue;
          }
          var width = post.preview.images[0].source.width;
          var height = post.preview.images[0].source.height;
          var score = Math.sqrt(width * height) * Math.pow(1 / (1 + Math.abs(16 / 9 - width / height)), 2);
          console.log("Score for index " + _i + ": " + score);
          scores[_i] = score;
        }

        var indeces = [].concat(_toConsumableArray(Array(scores.length).keys()));
        console.log(indeces);
        console.log(scores);

        //Sort but have largest first
        for (var _i2 = 1; _i2 < scores.length; _i2++) {

          for (var j = _i2; j > 0; j--) {

            if (scores[j] > scores[j - 1]) {
              var temp = scores[j];
              scores[j] = scores[j - 1];
              scores[j - 1] = temp;

              temp = indeces[j];
              indeces[j] = indeces[j - 1];
              indeces[j - 1] = temp;
            }
          }
        }

        //Handle the case for bad image requests.
        var i = 0;
        var img = document.getElementById("wallpaper-img");
        var errorHandler = function errorHandler() {
          var url = posts[indeces[++i]].data.url;
          console.log("Failed to load image, loading next url:", url);
          img.src = url;
        };

        //Remove listeners on load. Process any extra data here
        var loadHandler = function loadHandler() {
          img.removeEventListener('error', errorHandler);
          img.removeEventListener('load', loadHandler);
          console.log("Image loaded, removing listeners.");
          page.setState({ loading: false, imgid: posts[indeces[i]].data.id });
          console.log(page.state);
          setTimeout(function () {
            document.getElementById("load").style.display = "none";
            console.log("Setting display to none.");
          }, 1000);
        };

        img.addEventListener('error', errorHandler);
        img.addEventListener('load', loadHandler);
        img.src = posts[indeces[i]].data.url;
      };

      var url = 'https://www.reddit.com/r/Moescape/top/.json?sort=wee&t=day';
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);

      xhr.onload = function () {

        var json = JSON.parse(xhr.responseText);
        if (json.error == 1) {
          alert("Had an issue grabbing reddit data: " + json.message);
        } else {
          parseRedditPage(json);
        }
      };

      xhr.onerror = function () {
        console.log("Tried to request " + url + " but got an error instead.");
      };

      console.log("querying: " + url);
      xhr.send();
    }
  }, {
    key: "getName",
    value: function getName() {

      var page = this;
      chrome.storage.local.get("name", function (items) {
        page.setState({ name: items.name });
        console.log("Loaded name:", items.name);
      });
    }
  }, {
    key: "render",
    value: function render() {

      return React.createElement(
        React.Fragment,
        null,
        React.createElement(
          "div",
          { id: "main" },
          React.createElement(
            "div",
            { id: "wallpaper" },
            React.createElement("img", { id: "wallpaper-img" })
          ),
          React.createElement(Nav, null),
          React.createElement(Greeting, { name: this.state.name, page: this }),
          React.createElement(Footer, { imgid: this.state.imgid })
        ),
        React.createElement(
          "div",
          { id: "load", style: { opacity: this.state.loading ? "1" : "0" } },
          React.createElement("img", { id: "load-gif", src: "public/assets/images/dance.gif" }),
          React.createElement(
            "h1",
            null,
            " Loading "
          )
        )
      );
    }
  }]);

  return Page;
}(React.Component);

ReactDOM.render(React.createElement(Page, null), document.getElementById('react'));