var WebSocket = require('ws');
var fs = require('fs');
var http = require('https');
const {spawn,exec} = require('child_process');

var send1="{\"type\":\"connection_init\",\"payload\":{\"Authorization\":\"Bearer 265777668856-L9Zf-mrKHetsGneevoBEgm5WizDOSA\"}}";
var send2="{\"id\":\"1\",\"type\":\"start\",\"payload\":{\"variables\":{\"input\":{\"channel\":{\"teamOwner\":\"AFD2022\",\"category\":\"CONFIG\"}}},\"extensions\":{},\"operationName\":\"configuration\",\"query\":\"subscription configuration($input: SubscribeInput!) {\\n  subscribe(input: $input) {\\n    id\\n    ... on BasicMessage {\\n      data {\\n        __typename\\n        ... on ConfigurationMessageData {\\n          colorPalette {\\n            colors {\\n              hex\\n              index\\n              __typename\\n            }\\n            __typename\\n          }\\n          canvasConfigurations {\\n            index\\n            dx\\n            dy\\n            __typename\\n          }\\n          canvasWidth\\n          canvasHeight\\n          __typename\\n        }\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}}";
var send3="{\"id\":\"2\",\"type\":\"start\",\"payload\":{\"variables\":{\"input\":{\"channel\":{\"teamOwner\":\"AFD2022\",\"category\":\"CANVAS\",\"tag\":\"1\"}}},\"extensions\":{},\"operationName\":\"replace\",\"query\":\"subscription replace($input: SubscribeInput!) {\\n  subscribe(input: $input) {\\n    id\\n    ... on BasicMessage {\\n      data {\\n        __typename\\n        ... on FullFrameMessageData {\\n          __typename\\n          name\\n          timestamp\\n        }\\n        ... on DiffFrameMessageData {\\n          __typename\\n          name\\n          currentTimestamp\\n          previousTimestamp\\n        }\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}}";
const ws = new WebSocket('wss://gql-realtime-2.reddit.com/query', {
    origin: "https://hot-potato.reddit.com"
});
var file;
var request;
var prevTime=-1;
function download(url, time) {
    if (prevTime==-1) prevTime=time;
    if (prevTime!=time) {
        var cmd = `zip -r -0 -q ${"/data/"+prevTime+".zip"} ${"/data/"+prevTime+"/"}`
        exec(cmd);
        console.log(cmd);
        prevTime=time;
    }
    file = fs.createWriteStream("/data/"+time.toString()+"/"+url.substring(url.lastIndexOf('/')+1));
    if (!fs.existsSync("/data/"+time.toString()+"/")){
        fs.mkdirSync("/data/"+time.toString()+"/");
    }
    request = http.get(url, function(response) {

        response.pipe(file);

        // after download completed close filestream
        file.on("finish", () => {
            file.close();
            console.log("Downloaded "+url);
        });
    });
}

ws.on('open', function open() {
  ws.send(send1);
  ws.send(send2);
  ws.send(send3);
});

ws.on('message', function message(data) {
  var hi = JSON.parse(data);
  var url;
  if ('payload' in hi && 'data' in hi.payload) {
    var temp = hi.payload.data.subscribe.data
    url = temp.name;
    time= temp.currentTimestamp || temp.timestamp;
    time=parseInt(time);
    if (url) {
        console.log(url+" "+time);
        //console.log("/data/"+Math.floor(time/1000000).toString()+"/"+url.substring(url.lastIndexOf('/')+1))
        download(url, Math.floor(time/10000));
    }
  }
});