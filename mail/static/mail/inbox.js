document.addEventListener('DOMContentLoaded', function() {

  // Buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //event listener to the form
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  load_mailbox('inbox');
});

//Form data Processing
function send_email(event){
  // Modifies the default beheavor so it doesn't reload the page after submitting.
  event.preventDefault();

  const from = document.querySelector('#compose-sender').value;
  const to = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {  
    method: 'POST',
    credentials: "same-origin",
    headers: {
      "X-CSRFToken": getCookie("csrftoken"),
      "Accept": "application/json",
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender : from,
      recipients : to,
      subject : subject,
      body : body
    })
  })
  .then((response) => response.json())
  .then((result) => {
    load_mailbox('sent', result);
  })
  .catch((error) => console.log(error));
}


function compose_email() {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}
  
function load_mailbox(mailbox) {
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //Get data of the corresponding mailbox from the server
  fetch(`emails/${mailbox}`)
  .then((response)=>response.json())
  .then((emails)=>{
    emails.forEach(function(email){
    const parent_div = document.createElement('div') 
    build_emails(email, parent_div, mailbox)
    parent_div.addEventListener('click', ()=>read_email(email.id, mailbox))
    document.querySelector('#emails-view').appendChild(parent_div);
  })
  })
  .catch((error)=>console.log(error))
}


function build_emails(email, parent_div, mailbox){
  const content = document.createElement("div");
  const recipients = document.createElement("strong");
  if(mailbox==='inbox') {
    recipients.innerHTML = ` ${email.sender.split('<')[0]} : `;
  }else {
    recipients.innerHTML = ` ${email.recipients} : `;
  }
  content.appendChild(recipients);
  content.innerHTML += email["subject"];

  const date = document.createElement("div");
  date.innerHTML = email["timestamp"];
  date.style.display = "inline-block";
  date.style["font-size"] = '14px';
  date.style.float = "right";

  if(email['read']) {
    parent_div.className = "text-muted";
    date.className = "text-muted";
  }else {
    date.style.color = 'black';
  }
  content.appendChild(date);

  parent_div.appendChild(content);
  parent_div.style.borderStyle = "ridge";
  parent_div.style.borderWidth = "3px";
  parent_div.style['border-radius'] = "6px";
  parent_div.style.padding = "4px";
  parent_div.style.margin = "10px";
  parent_div.style.cursor = "pointer";
}


function read_email(email_id, mailbox){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  // Erase any email that was here
  document.querySelector("#email-view").innerHTML = "";

  fetch(`emails/${email_id}`)
  .then((response)=>response.json())
  .then((email)=>{
    build_email(email, email_id, mailbox);
  })
  .catch(error => console.log(error));
}


function build_email(email, email_id, mailbox) {
  const from = document.createElement('div');
  const to = document.createElement('div');
  const subject = document.createElement('div');
  const timestamp = document.createElement('div');
  const body = document.createElement('div');
  const reply_button = document.createElement('div');
  const markasread_button = document.createElement('div');

  from.innerHTML = `<strong> From : </strong> ${email.sender.replace(/[<>]/g," ")}`;
  to.innerHTML = `<strong> To : </strong> ${email.recipients}`;
  subject.innerHTML = `<strong> Subject : ${email.subject} </strong>`;
  timestamp.innerHTML = `<strong> Timestamp : </strong> ${email.timestamp}`;
  body.innerHTML = email.body;

  reply_button.innerHTML = 'Reply';
  reply_button.classList = "btn btn-outline-primary m-2";
  reply_button.addEventListener("click", () => compose_reply(email, mailbox));

  if(mailbox == "inbox") {
    markasread_button.innerHTML = 'Mark as Read';
    markasread_button.classList = "btn btn-outline-primary m-2";
    markasread_button.addEventListener("click", () => {
      fetch(`/emails/${email_id}`, {
        method: "PUT",
        credentials: "same-origin",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
          "Accept": "application/json",
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          read: true
        })
      });
      markasread_button.innerHTML = 'Marked as Read';
      markasread_button.classList = "btn btn-outline-secondary m-2";
    })
  }else {}

  document.querySelector("#email-view").appendChild(from);
  document.querySelector("#email-view").appendChild(to);
  document.querySelector("#email-view").appendChild(subject);
  document.querySelector("#email-view").appendChild(timestamp);
  document.querySelector("#email-view").appendChild(reply_button);
  document.querySelector("#email-view").appendChild(markasread_button);
  document.querySelector("#email-view").appendChild(document.createElement("hr"));
  document.querySelector("#email-view").appendChild(body);
}


function compose_reply(email, mailbox){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#compose-view').querySelector('h3').innerHTML = "Reply mail";
  // Clear out composition fields
  if(mailbox === 'inbox') {
    document.querySelector('#compose-recipients').value = `${email.sender_email}`;
  }else {
    document.querySelector('#compose-recipients').value = `${email.recipients_email}`;
  }
  document.querySelector('#compose-subject').value = ((email["subject"].match(/^(Re:)\s/)) ? email["subject"] : "Re: " + email["subject"]);
  document.querySelector('#compose-body').value = `On ${email.timestamp}  ${email.sender} wrote: \n${email.body}\n----------------------------------------------------------------\n`;
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
