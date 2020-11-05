(function () {
  let dataConnection = null;
  const peersEl = document.querySelector(".peers");
  const sendButtonEl = document.querySelector(".send-new-message-button");
  const newMessageEl = document.querySelector(".new-message");
  const messagesEl = document.querySelector(".messages");
  const theirVideoContainer = document.querySelector(".video-container.them");

  const printMessage = (text, who) => {
    const messageEl = document.createElement("div");
    messageEl.classList.add("message", who);
    let today = new Date();
    let time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    messageEl.innerHTML = `<div>${text}</div>`;
    messagesEl.append(messageEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  };

  // Get peer id from URL (no hash):
  const myPeerId = location.hash.slice(1);

  //Connect to Peer server
  let peer = new Peer(myPeerId, {
    host: "glajan.com",
    port: 8443,
    path: "/myapp",
    secure: true,
    config: {
      iceServers: [
        { urls: ["stun:eu-turn7.xirsys.com"] },
        {
          username:
            "1FOoA8xKVaXLjpEXov-qcWt37kFZol89r0FA_7Uu_bX89psvi8IjK3tmEPAHf8EeAAAAAF9NXWZnbGFqYW4=",
          credential: "83d7389e-ebc8-11ea-a8ee-0242ac140004",
          urls: [
            "turn:eu-turn7.xirsys.com:80?transport=udp",
            "turn:eu-turn7.xirsys.com:3478?transport=udp",
            "turn:eu-turn7.xirsys.com:80?transport=tcp",
            "turn:eu-turn7.xirsys.com:3478?transport=tcp",
            "turns:eu-turn7.xirsys.com:443?transport=tcp",
            "turns:eu-turn7.xirsys.com:5349?transport=tcp",
          ],
        },
      ],
    },
  });

  // Print peer id on connection 'open' event.
  peer.on("open", (id) => {
    const myPeerIdEl = document.querySelector(".my-peer-id");
    myPeerIdEl.innerText = id;
  });

  // Error message.
  peer.on("error", (errorMessage) => {
    console.error(errorMessage);
  });

  // On incoming connection
  peer.on("connection", (connection) => {
    // Close exsisting connection and set new one.
    dataConnection && dataConnection.close();
    dataConnection = connection;

    const event = new CustomEvent("peer-changed", { detail: connection.peer });
    document.dispatchEvent(event);
  });

  // Event listener for click "Refresh list".
  const listPeersButtonEl = document.querySelector(".list-all-peers-button");
  listPeersButtonEl.addEventListener("click", () => {
    peer.listAllPeers((peers) => {
      // Add peers to list.
      const listItems = peers

        // Filter out our own name
        .filter((peerId) => peerId !== peer._id)

        // Loop through all peers and print their name.
        .map((peer) => {
          return `
            <li>
                <button class="connect-button peerId-${peer}">${peer}</button>
            </li>`;
        })
        .join("");

      const ul = "<ul>" + listItems + "</ul>";
      peersEl.innerHTML = ul;
    });
  });

  // Event listener for click peer button.
  peersEl.addEventListener("click", (event) => {
    // Only listen to clicks on button.
    if (!event.target.classList.contains("connect-button")) return;

    // Get peerId from button element.
    const theirPeerId = event.target.innerText;

    //Close existing connection.
    dataConnection && dataConnection.close();

    // Connect to peer.
    dataConnection = peer.connect(theirPeerId);

    dataConnection.on("open", () => {
      // Dispatch Custom Event with connected peer id.
      const event = new CustomEvent("peer-changed", { detail: theirPeerId });
      document.dispatchEvent(event);
    });
  });

  // Event listener for custom event 'peer-changed'.
  document.addEventListener("peer-changed", (e) => {
    const peerId = e.detail;

    // Get cklicked button.
    const connectButtonEl = document.querySelector(
      `.connect-button.peerId-${peerId}`
    );

    //Remove class 'connected' from button.
    document.querySelectorAll(".connect-button.connected").forEach((button) => {
      button.classList.remove("connected");
    });

    //Add class 'connected' to clicked button.
    connectButtonEl && connectButtonEl.classList.add("connected");

    // Listen for incoming data/textmessage.
    dataConnection.on("data", (textMessage) => {
      printMessage(textMessage, "them");
    });

    // Set focus on text input field
    newMessageEl.focus();

    //
    theirVideoContainer.querySelector(".name").innerText = peerId;
    theirVideoContainer.classList.add("connected");
    theirVideoContainer.querySelector(".start").classList.add("active");
    theirVideoContainer.querySelector(".stop").classList.remove("active");
  });

  // Send message to peer.
  const sendMessage = (e) => {
    if (!dataConnection) return;
    if (newMessageEl.value === "") return;

    if (e.type === "click" || e.keyCode === 13) {
      dataConnection.send(newMessageEl.value);
      printMessage(newMessageEl.value, "me");

      // Clear text input field.
      newMessageEl.value = "";
      2;
    }
    //Set focus on text input field.
    newMessageEl.focus();
  };

  // Event listeners for "send".
  sendButtonEl.addEventListener("click", sendMessage);
  newMessageEl.addEventListener("keyup", sendMessage);

  // Event listener for click 'Start video chat'.
  const startVideoButton = theirVideoContainer.querySelector(".start");
  const stopVideoButton = theirVideoContainer.querySelector(".stop");
  startVideoButton.addEventListener("click", () => {
    startVideoButton.classList.remove("active");
    stopVideoButton.classList.add("active");
  });
})(); //Stäng tomma funktionen.
