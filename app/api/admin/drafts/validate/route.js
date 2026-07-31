import drafts from "../../../../../content/drafts.json";

export async function GET(){
 const result=drafts.map(d=>({id:d.id,title:d.title,missing:[!d.title&&"title",!d.sourceUrl&&"sourceUrl",!d.deadline&&"deadline"].filter(Boolean)}));
 return Response.json({items:result});
}
