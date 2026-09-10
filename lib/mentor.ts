export type MentorContext = {setupReady:boolean;completed:number;lab?:string};
export interface MentorProvider {name:string;respond(message:string,context:MentorContext):Promise<string>;}
export const guidedMentor:MentorProvider={
 name:'Guided mode · rule-based',
 async respond(message,c) {
 const q=message.toLowerCase();
 if (/(scan|attack|exploit).*(google|website|random|outside)|out.of.scope/.test(q)) return 'Keep practice inside your assigned BugForge simulation or your own local training app. For any real program, first read its policy and confirm the exact asset is in scope. Which authorized lab are you working on?';
 if (/report|impact/.test(q)) return 'Start with the expected access rule. Then show the owner baselines, the one changed input, and the returned private record. Keep impact limited to what your evidence proves. After completing Access Control, save the finding and open Reports to turn that evidence into a draft.';
 if (/xss|reflect|payload|marker|search|q=/.test(q)) return 'First send a harmless unique marker, such as FORGE-42. Does it appear in the response? Identify whether it lands in HTML text, an attribute, or a script. Compare how special characters are encoded. Reflection alone does not prove script execution. What output context do you see?';
 if (/idor|owner|authorization|parameter|order|suspicious|vulnerab|verify/.test(q)) return 'Establish two owner baselines with the provided test accounts. Then keep Alex’s identity unchanged and change only the order ID. Did the response actually contain Jordan’s private order, or just a generic success page? Compare with the protected mode before deciding.';
 if (/request|http|response|status|header|intercept/.test(q)) return 'Read the request line first: method, path, then query parameters. Next inspect the response status, Content-Type, and body together. Change only one value and send it again. What changed in the returned data?';
 if (/next|start|setup|docker|burp/.test(q)) return c.setupReady ? 'Open HTTP Basics and send the initial request. Change q to a different search term and compare the two responses. When you can explain the difference, submit your evidence check.' : 'Your first mission is to build your lab. Open Learn → Environment setup. Burp’s built-in browser avoids manual proxy configuration. Tick each step after checking it yourself, or explicitly skip setup to use the built-in simulations.';
 return 'Let’s narrow the question. What action did you take, what response did you expect, and what did you observe? Share a fictional lab endpoint and the non-sensitive part of the response. I can guide request inspection, access-control evidence, reflected input, or report writing.';
 }
};
// Future model providers implement this server-side interface. No remote model
// calls, browser API keys, screen capture, or autonomous testing in this MVP.
