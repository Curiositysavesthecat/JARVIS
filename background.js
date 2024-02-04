console.log("Starting background.JS")
const apiKey = "";
const url = "https://api.openai.com/v1/chat/completions";

async function query(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
		{
			headers: { Authorization: "Bearer " },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}


async function OpenaiFetchAPI(messages) {
    console.log("Using OPENAI function");
    console.log(messages);
    console.log("Calling GPT3");
    const data = {
        model: "gpt-3.5-turbo",
        messages:messages,
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }
    const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(data),
      };
    const response = await fetch(url, options)
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        return data;
    })
    .catch((error) => {
        console.error('Error:', error);
    });
      console.log("success");
    console.log(response['choices'][0]['message']['content']);
    return response['choices'][0]['message']['content'];

}
class Jarvis{
    constructor(command)
    {
        this.command = command;
        // openAI credentials
    }

    async parser(type)
    {
        if(type == "number")
        {
            const messages=[
                  {
                    "role": "system",
                    "content": "You have only one job. You will be given a statement about navigating through tabs in two directions. Forward or backward. You have to ONLY return the numerical value of the number of times to go forward or backward. Do not return ANYTHING else."
                  },
                  {
                    "role": "user",
                    "content": this.command
                  },
                ]
            const response =  await OpenaiFetchAPI(messages);
            const a = Number(response);
            return a;
        }
        else if(type =="websites")
        {
            const messages= [
                {
                  "role": "system",
                  "content": "You have one job : You will be given a request or a command to help user navigate tabs, you have to identify the names of websites, and return them in  a comma separated manner. Do not put any space after the comma.Only return the list of names and NOTHING else."
                },
                {
                  "role": "user",
                  "content": this.command
                },
              ]
            // OpenAI call to return comma seperated values
            const response =  await OpenaiFetchAPI(messages);
            return String(response).split(",");
        }
    }

    async get_IDs_by_name(names)
    {
        const IDs = [];
        // get a list of IDs of tabs with names in URL
        const x = names.length;
        let i ;
        const urls = [];
        for(i = 0; i<x ;i++)
        {
            const site = names[i];
            let here = ("https://*."+site+".com/*");
            const tabs = await chrome.tabs.query({url : String(here)});
            let j;
            for(j = 0;j<tabs.length;j++)
            {
                IDs.push(tabs[j].id);
            }
        }
        return IDs;
    }
    async go_back()
    {
        // done
        const times = await this.parser("number");
        let i ;
        for(i = 0; i<times;i++)
        {
            // go forward or backward n number of times
            const tabs = await chrome.tabs.query({active: true});
            console.log(tabs[0]);
            Promise.resolve(chrome.tabs.goBack(tabs[0].id));
        }
    }

    async go_forward()
    {
        // done
        const times = await this.parser("number", this.command);
        let i;
        for(i=0;i<times;i++)
        {
            const tabs = await chrome.tabs.query({active: true});
            console.log(tabs[0]);
            Promise.resolve(chrome.tabs.goForward(tabs[0].id));
        }
    }

    async close_current()
    {
        // done
        // get current ID using chrome tabs
        const tabs = await chrome.tabs.query({active: true});
        // close current tab
        Promise.resolve(chrome.tabs.remove(tabs[0].id));
    }

    async close_multiple(IDs)
    {
        // get all tab IDs
        Promise.resolve(chrome.tabs.remove(IDs));
        //remove one or more tabs pass the list of IDs.
    }

    async regroup(IDs)
    {
        // get all tab IDs
        Promise.resolve(chrome.tabs.group({tabIds : IDs}));
        // group one or more tabs together pass the list of IDs
    }

    async surprise_me(){
        const urls = ["https://www.patatap.com/", "https://libraryofbabel.info/search.html" ,"https://www.iwastesomuchtime.com/" , "https://codepen.io/akm2/full/AGgarW", "https://stars.chromeexperiments.com/","https://orb.farm/","https://findtheinvisiblecow.com/", "https://papertoilet.com/"];
        let x = urls.length;
        Promise.resolve(chrome.tabs.create({ url : urls[Math.floor(x*(Math.random()))]}));
        // open a random website that is ENTERTAINING.
    }

    async open_new()
    {
        const list = await this.parser("websites");
        let x = list.length;
        let i = 0;
        for(i = 0;i<x;i++)
        {
            if(i!=x-1){
                Promise.resolve(chrome.tabs.create({url :"https://www."+ list[i]+".com", active : false}));
            }
            else{
                Promise.resolve(chrome.tabs.create({url : "https://www." + list[i]+".com"}))
            }
        }
    }

    async get_titles(items)
    {
        console.log(items[0]);
        let titles = [];
        let i = 0;
        const x = items.length;
        items.forEach(item=>
            titles.push(item.title)
        );
        return titles;
    }

    async reopen_closed_tabs()
    {
        const items = await chrome.history.search({text : ""});
        console.log(items);
        this.get_titles(items);
        console.log(items[0].hasOwnProperty("title"))
        let titles = await this.get_titles(items);
        console.log(titles);
        let data = {
            "inputs":{
                "source_sentence" : this.command,
                "sentences": titles
            }
        }
        console.log(data);
        let index = await query(data);
        console.log(index);
        let i = 0;
        let x = items.length;
        for(i = 0;i<x;i++)
        {
            if(index[i]>=0.25)
            {
            Promise.resolve(chrome.tabs.create({url : items[i].url}));
            }
        }
    }

};


class control{
    constructor(command)
    {
        this.command = command;
    }

    async classifier()
    {
        let answer = 0;
        // openAI function call to set the prompts, classify this.command()
        const messages =  [
            {
              "role": "system",
              "content": "You are a task classifier. Given a particular task to do, you just return the numerical value of the ID of the task. Here are all the task types, with their IDs as the serial numbers at the starting of their description.\n0\nA task that indicates that the user wants to open or initiate something new ,like creating a tab or opening a tab.\n1\nA task that indicates to close the current tab session or the present session.\n2\nA task that indicates to close more than one (multiple) things or close or shutdown tabs of a particular website.\n3\ntask that indicated that the user wants to navigate to the previous tab, or go backwards.\n4\nA task that indicated that the user wants to navigate to the next tab, or go forward.\n5\nA task that indicates that the user wants to group or assimilate particular types of tabs together.\n6\nWhen the user is sad, hungry or bored. Also when you think that the command doesn't follow under any of the above categories.\n7\nWhen the user is trying to reopen closed tabs. REOPEN, not open new tabs, but open already closed tabs.\n\nRemember, ONLY return the numerical value of the type of task and NOTHING else.\""
            },
            {
              "role": "user",
              "content": this.command
            },
          ]
        const response = await OpenaiFetchAPI(messages);

        await this.trigger(Number(response));
    }

    async trigger(task)
    {
        const today = new Jarvis(this.command);
        // takes in a number and triggers a task according to it
        switch(task){
            case 0 :
                today.open_new()
                break;
            case 1 :
                // close current tab
                today.close_current();
                break;
            case 2 :
                // close multiple tabs
                const naam = await today.parser("websites");
                const pehchan = await today.get_IDs_by_name(naam);
                await today.close_multiple(pehchan);
                break;
            case 3 : 
                // go back 
                await today.go_back();
                break;
            case 4 :
                // go forward
                await today.go_forward();
                break;
            case 5 :
                // regroup tabs of particular websites
                const names = await today.parser("websites");
                const IDs = await today.get_IDs_by_name(names);
                await today.regroup(IDs);
                break;
            case 6 :
                // surprise me by opening an interesting website
                await today.surprise_me();
                break;
            case 7:
                // reopening closed tabs
                await today.reopen_closed_tabs();
                break;
        }

    }
}

chrome.runtime.onMessage.addListener(async (obj, sender, response) => {
    const {type, command} = obj;
    if(type =="NEW_COMMAND")
    {
        //we have initiated a control class
        const handler = new control(String(command));
        handler.classifier();
        console.log(command);
        console.log("We are at service_worker, the  message has been listened");
        // let current = chrome.windows.WINDOW_ID_CURRENT;
        // let tabs = await chrome.tabs.query({url : "https://*.youtube.com/*"});
        // console.log(tabs);
    }
});
