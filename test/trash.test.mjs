import test from 'node:test';
import assert from 'node:assert/strict';
import { Gmail } from '../src/gmail.mjs';
test('lixeira exige habilitação e ID válido antes de acessar a rede', async () => {
 const request=()=>{throw new Error('Não deve acessar rede');};
 await assert.rejects(new Gmail({},request).trashMessage('abc'), /desativada/);
 await assert.rejects(new Gmail({allowTrash:true},request).trashMessage('../send'), /inválido/);
 await assert.rejects(new Gmail({allowTrash:true},request).api('messages/send',{}), /não permitida/);
});
test('move apenas a mensagem solicitada e exige confirmação TRASH', async () => {
 const g=new Gmail({allowTrash:true},async(url,options)=>{
  assert.equal(url,'https://gmail.googleapis.com/gmail/v1/users/me/messages/abc/trash');
  assert.equal(options.method,'POST');
  return {ok:true,json:async()=>({id:'abc',labelIds:['TRASH']})};
 });
 assert.equal((await g.trashMessage('abc')).id,'abc');
 const bad=new Gmail({allowTrash:true},async()=>({ok:true,json:async()=>({id:'abc',labelIds:[]})}));
 await assert.rejects(bad.trashMessage('abc'), /sem confirmação/);
 const denied=new Gmail({allowTrash:true},async()=>({ok:false,status:403}));
 await assert.rejects(denied.trashMessage('abc'), /403/);
});
