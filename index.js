document.addEventListener('DOMContentLoaded', ()=>{
   const browse = document.getElementById("button")

   browse.addEventListener('click', async ()=>
   {
      console.log("Event listened");
      const command = document.getElementById("command");
      let instruction = command.value;
      console.log("message is being sent");
      chrome.runtime.sendMessage(
         {type : "NEW_COMMAND", command : String(instruction)}
       )
   }
   )
})





