const container = document.querySelector(".container");
const coffees = [
  {
    name: "Perspiciatis",
    image: "images/coffee1.jpg"
  },
  {
    name: "Voluptatem",
    image: "images/coffee2.jpg"
  },
  {
    name: "Explicabo",
    image: "images/coffee3.jpg"
  },
  {
    name: "Rchitecto",
    image: "images/coffee4.jpg"
  },
  {
    name: " Beatae",
    image: "images/coffee5.jpg"
  },
  {
    name: " Vitae",
    image: "images/coffee6.jpg"
  },
  {
    name: "Inventore",
    image: "images/coffee7.jpg"
  },
  {
    name: "Veritatis",
    image: "images/coffee8.jpg"
  },
  {
    name: "Accusantium",
    image: "images/coffee9.jpg"
  }
];
const showCoffees = () => {
  let output = "";
  coffees.forEach(
    ({ name, image }) =>
      (output += `
              <div class="card">
                <img class="card--avatar" src=${image} />
                <h1 class="card--title">${name}</h1>
                <a class="card--link" href="#">Taste</a>
              </div>
              `)
  );
  container.innerHTML = output;
};
document.addEventListener("DOMContentLoaded", showCoffees);
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then(res => console.log("service worker registered"))
      .catch(err => console.log("service worker not registered", err));
  });
}
function getUserMedia(constraints) {
  // if Promise-based API is available, use it
  if (navigator.mediaDevices) {
    return navigator.mediaDevices.getUserMedia(constraints);
  }
    
  // otherwise try falling back to old, possibly prefixed API...
  var legacyApi = navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia;
    
  if (legacyApi) {
    // ...and promisify it
    return new Promise(function (resolve, reject) {
      legacyApi.bind(navigator)(constraints, resolve, reject);
    });
  }
}
function getStream (type) {
  if (!navigator.mediaDevices && !navigator.getUserMedia && !navigator.webkitGetUserMedia &&
    !navigator.mozGetUserMedia && !navigator.msGetUserMedia) {
    alert('User Media API not supported.');
    return;
  }
  var constraints = {};
  constraints[type] = true;
  
  getUserMedia(constraints)
    .then(function (stream) {
      var mediaControl = document.querySelector(type);
      
      if ('srcObject' in mediaControl) {
        mediaControl.srcObject = stream;
      } else if (navigator.mozGetUserMedia) {
        mediaControl.mozSrcObject = stream;
      } else {
        mediaControl.src = (window.URL || window.webkitURL).createObjectURL(stream);
      }
      
      mediaControl.play();
    })
    .catch(function (err) {
      alert('Error: ' + err);
    });
}
var target = document.getElementById('target');
var watchId;
function appendLocation(location, verb) {
  verb = verb || 'updated';
  var newLocation = document.createElement('p');
  newLocation.innerHTML = 'Location ' + verb + ': ' + location.coords.latitude + ', ' + location.coords.longitude + '';
  target.appendChild(newLocation);
}
if ('geolocation' in navigator) {
  document.getElementById('askButton').addEventListener('click', function () {
    navigator.geolocation.getCurrentPosition(function (location) {
      appendLocation(location, 'fetched');
    });
    watchId = navigator.geolocation.watchPosition(appendLocation);
  });
} else {
  target.innerText = 'Geolocation API not supported.';
}
if ("DeviceOrientationEvent" in window) {
  window.addEventListener("deviceorientation", deviceOrientationHandler, false);
} else {
  document.getElementById("logoContainer").innerText =
    "Device Orientation API not supported.";
}
function deviceOrientationHandler(eventData) {
  var tiltLR = eventData.gamma;
  var tiltFB = eventData.beta;
  var dir = eventData.alpha;
  document.getElementById("doTiltLR").innerHTML = Math.round(tiltLR);
  document.getElementById("doTiltFB").innerHTML = Math.round(tiltFB);
  document.getElementById("doDirection").innerHTML = Math.round(dir);
  var logo = document.getElementById("imgLogo");
  logo.style.webkitTransform =
    "rotate(" + tiltLR + "deg) rotate3d(1,0,0, " + tiltFB * -1 + "deg)";
  logo.style.MozTransform = "rotate(" + tiltLR + "deg)";
  logo.style.transform =
    "rotate(" + tiltLR + "deg) rotate3d(1,0,0, " + tiltFB * -1 + "deg)";
}
if ("localStorage" in window || "sessionStorage" in window) {
  var selectedEngine;
  var logTarget = document.getElementById("target");
  var valueInput = document.getElementById("value");
  var reloadInputValue = function () {
    console.log(selectedEngine, window[selectedEngine].getItem("myKey"));
    valueInput.value = window[selectedEngine].getItem("myKey") || "";
  };
  var selectEngine = function (engine) {
    selectedEngine = engine;
    reloadInputValue();
  };
  function handleChange(change) {
    var timeBadge = new Date().toTimeString().split(" ")[0];
    var newState = document.createElement("p");
    newState.innerHTML = "" + timeBadge + " " + change + ".";
    logTarget.appendChild(newState);
  }
  var radios = document.querySelectorAll("#selectEngine input");
  for (var i = 0; i < radios.length; ++i) {
    radios[i].addEventListener("change", function () {
      selectEngine(this.value);
    });
  }
  selectEngine("localStorage");
  valueInput.addEventListener("keyup", function () {
    window[selectedEngine].setItem("myKey", this.value);
  });
  var onStorageChanged = function (change) {
    var engine =
      change.storageArea === window.localStorage
        ? "localStorage"
        : "sessionStorage";
    handleChange(
      "External change in " +
        engine +
        ": key " +
        change.key +
        " changed from " +
        change.oldValue +
        " to " +
        change.newValue +
        ""
    );
    if (engine === selectedEngine) {
      reloadInputValue();
    }
  };
  window.addEventListener("storage", onStorageChanged);
}
function readContacts() {
  var api = navigator.contacts || navigator.mozContacts;
  if (api && !!api.select) {
    // new Chrome API
    api
      .select(["name", "email"], { multiple: true })
      .then(function (contacts) {
        consoleLog("Found " + contacts.length + " contacts.");
        if (contacts.length) {
          consoleLog(
            "First contact: " +
              contacts[0].name +
              " (" +
              contacts[0].email +
              ")"
          );
        }
      })
      .catch(function (err) {
        consoleLog("Fetching contacts failed: " + err.name);
      });
  } else if (api && !!api.find) {
    // old Firefox OS API
    var criteria = {
      sortBy: "familyName",
      sortOrder: "ascending",
    };
    api
      .find(criteria)
      .then(function (contacts) {
        consoleLog("Found " + contacts.length + " contacts.");
        if (contacts.length) {
          consoleLog(
            "First contact: " +
              contacts[0].givenName[0] +
              " " +
              contacts[0].familyName[0]
          );
        }
      })
      .catch(function (err) {
        consoleLog("Fetching contacts failed: " + err.name);
      });
  } else {
    consoleLog("Contacts API not supported.");
  }
}
function consoleLog(data) {
  var logElement = document.getElementById("log");
  logElement.innerHTML += data + "\n";
}
function getReadFile(reader, i) {
  return function () {
    var li = document.querySelector('[data-idx="' + i + '"]');
    li.innerHTML += 'File starts with "' + reader.result.substr(0, 25) + '"';
  }
}
function readFiles(files) {
  document.getElementById('count').innerHTML = files.length;
  var target = document.getElementById('target');
  target.innerHTML = '';
  for (var i = 0; i < files.length; ++i) {
    var item = document.createElement('li');
    item.setAttribute('data-idx', i);
    var file = files[i];
    var reader = new FileReader();
    reader.addEventListener('load', getReadFile(reader, i));
    reader.readAsText(file);
    window.localStorage.setItem("My File", file);

    item.innerHTML = '' + file.name + ', ' + file.type + ', ' + file.size + ' bytes, last modified ' + file.lastModifiedDate + '';
    target.appendChild(item);
  };
}
async function writeFile() {
  if (!window.chooseFileSystemEntries) {
    alert('Native File System API not supported');
    return;
  }
  
  const target = document.getElementById('target');
  target.innerHTML = 'Opening file handle...';
  
  const handle = await window.chooseFileSystemEntries({
    type: 'save-file',
  });
  
  const file = await handle.getFile()
  const writer = await handle.createWriter();
  await writer.write(0, 'Hello world from What Web Can Do!');
  await writer.close()
  
  target.innerHTML = 'Test content written to ' + file.name + '.';
}
if ('storage' in navigator && 'estimate' in navigator.storage) {
  navigator.storage.estimate()
    .then(estimate => {
      document.getElementById('usage').innerHTML = estimate.usage;
      document.getElementById('quota').innerHTML = estimate.quota;
      document.getElementById('percent').innerHTML = (estimate.usage * 100 / estimate.quota).toFixed(0);
    });
}
if ('storage' in navigator && 'persisted' in navigator.storage) {
  navigator.storage.persisted()
    .then(persisted => {
      document.getElementById('persisted').innerHTML = persisted ? 'persisted' : 'not persisted';
    });
}
function requestPersistence() {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    navigator.storage.persist()
      .then(persisted => {
        document.getElementById('persisted').innerHTML = persisted ? 'persisted' : 'not persisted';
      });
  }
}
function readSingleFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    displayContents(contents);
  };
  reader.readAsText(file);
}
function displayContents(contents) {
  var element = document.getElementById('file-content');
  element.textContent = contents;
}
document.getElementById('file-input')
  .addEventListener('change', readSingleFile, false);
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then((res) => console.log("service worker registered"))
      .catch((err) => console.log("service worker not registered", err));
  });
}
