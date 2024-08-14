"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9182],{94473:function(e,t,n){var r=n(46385).Buffer,o=n(60305),i={data:r.alloc(0),dataLength:0,sequence:0};t.Z=function(e,t){return{makeBlocks:function(n){var o,i,c=r.concat([(o=n.length,(i=r.alloc(2)).writeUInt16BE(o,0),i),n]),s=t-5,a=Math.ceil(c.length/s);c=r.concat([c,r.alloc(a*s-c.length+1).fill(0)]);for(var u=[],l=0;l<a;l++){var d=r.alloc(5);d.writeUInt16BE(e,0),d.writeUInt8(5,2),d.writeUInt16BE(l,3);var h=c.slice(l*s,(l+1)*s);u.push(r.concat([d,h]))}return u},reduceResponse:function(t,n){var c=t||i,s=c.data,a=c.dataLength,u=c.sequence;if(n.readUInt16BE(0)!==e)throw new o.TransportError("Invalid channel","InvalidChannel");if(5!==n.readUInt8(2))throw new o.TransportError("Invalid tag","InvalidTag");if(n.readUInt16BE(3)!==u)throw new o.TransportError("Invalid sequence","InvalidSequence");t||(a=n.readUInt16BE(5)),u++;var l=n.slice(t?5:7);return(s=r.concat([s,l])).length>a&&(s=s.slice(0,a)),{data:s,dataLength:a,sequence:u}},getReducedResult:function(e){if(e&&e.dataLength===e.data.length)return e.data}}}},19182:function(e,t,n){n.r(t),n.d(t,{default:function(){return X}});var r,o,i,c,s=n(63606),a=n.n(s),u=n(60305);let l=0,d=[],h=(e,t,n)=>{let r={type:e,id:String(++l),date:new Date};t&&(r.message=t),n&&(r.data=n),v(r)},p=({type:e,message:t,data:n,context:r})=>{let o={type:e,id:String(++l),date:new Date};t&&(o.message=t),n&&(o.data=n),r&&(o.context=r),v(o)};class f{constructor(e,t){this.type=e,this.context=t}trace(e,t){p({type:this.type,message:e,data:t,context:this.context})}getContext(){return this.context}setContext(e){this.context=e}updateContext(e){this.context=Object.assign(Object.assign({},this.context),e)}getType(){return this.type}setType(e){this.type=e}withType(e){return new f(e,this.context)}withContext(e){return new f(this.type,e)}withUpdatedContext(e){return new f(this.type,Object.assign(Object.assign({},this.context),e))}}function v(e){for(let t=0;t<d.length;t++)try{d[t](e)}catch(e){console.error(e)}}"undefined"!=typeof window&&(window.__ledgerLogsListen=e=>(d.push(e),()=>{let t=d.indexOf(e);-1!==t&&(d[t]=d[d.length-1],d.pop())}));var g=n(46385).Buffer,m=function(e,t,n,r){return new(n||(n=Promise))(function(o,i){function c(e){try{a(r.next(e))}catch(e){i(e)}}function s(e){try{a(r.throw(e))}catch(e){i(e)}}function a(e){var t;e.done?o(e.value):((t=e.value)instanceof n?t:new n(function(e){e(t)})).then(c,s)}a((r=r.apply(e,t||[])).next())})};class y{constructor({context:e,logType:t}={}){this.exchangeTimeout=3e4,this.unresponsiveTimeout=15e3,this.deviceModel=null,this._events=new(a()),this.send=(e,t,n,r,...o)=>m(this,[e,t,n,r,...o],void 0,function*(e,t,n,r,o=g.alloc(0),i=[u.StatusCodes.OK],{abortTimeoutMs:c}={}){let s=this.tracer.withUpdatedContext({function:"send"});if(o.length>=256)throw s.trace("data.length exceeded 256 bytes limit",{dataLength:o.length}),new u.TransportError("data.length exceed 256 bytes limit. Got: "+o.length,"DataLengthTooBig");s.trace("Starting an exchange",{abortTimeoutMs:c});let a=yield this.exchange(g.concat([g.from([e,t,n,r]),g.from([o.length]),o]),{abortTimeoutMs:c});s.trace("Received response from exchange");let l=a.readUInt16BE(a.length-2);if(!i.some(e=>e===l))throw new u.TransportStatusError(l);return a}),this._appAPIlock=null,this.tracer=new f(null!=t?t:"transport",e)}exchange(e,{abortTimeoutMs:t}={}){throw Error("exchange not implemented")}exchangeBulk(e,t){let n=!1;return m(this,void 0,void 0,function*(){if(!n)for(let r of e){let e=yield this.exchange(r);if(n)return;let o=e.readUInt16BE(e.length-2);if(o!==u.StatusCodes.OK)throw new u.TransportStatusError(o);t.next(e)}}).then(()=>!n&&t.complete(),e=>!n&&t.error(e)),{unsubscribe:()=>{n=!0}}}setScrambleKey(e){}close(){return Promise.resolve()}on(e,t){this._events.on(e,t)}off(e,t){this._events.removeListener(e,t)}emit(e,...t){this._events.emit(e,...t)}setDebugMode(){console.warn("setDebugMode is deprecated. use @ledgerhq/logs instead. No logs are emitted in this anymore.")}setExchangeTimeout(e){this.exchangeTimeout=e}setExchangeUnresponsiveTimeout(e){this.unresponsiveTimeout=e}static create(e=3e3,t){return new Promise((n,r)=>{let o=!1,i=this.listen({next:t=>{o=!0,i&&i.unsubscribe(),c&&clearTimeout(c),this.open(t.descriptor,e).then(n,r)},error:e=>{c&&clearTimeout(c),r(e)},complete:()=>{c&&clearTimeout(c),o||r(new u.TransportError(this.ErrorMessage_NoDeviceFound,"NoDeviceFound"))}}),c=t?setTimeout(()=>{i.unsubscribe(),r(new u.TransportError(this.ErrorMessage_ListenTimeout,"ListenTimeout"))},t):null})}exchangeAtomicImpl(e){return m(this,void 0,void 0,function*(){let t;let n=this.tracer.withUpdatedContext({function:"exchangeAtomicImpl",unresponsiveTimeout:this.unresponsiveTimeout});if(this.exchangeBusyPromise)throw n.trace("Atomic exchange is already busy"),new u.TransportRaceCondition("An action was already pending on the Ledger device. Please deny or reconnect.");let r=new Promise(e=>{t=e});this.exchangeBusyPromise=r;let o=!1,i=setTimeout(()=>{n.trace('Timeout reached, emitting Transport event "unresponsive"',{unresponsiveTimeout:this.unresponsiveTimeout}),o=!0,this.emit("unresponsive")},this.unresponsiveTimeout);try{let t=yield e();return o&&(n.trace("Device was unresponsive, emitting responsive"),this.emit("responsive")),t}finally{n.trace("Finalize, clearing busy guard"),clearTimeout(i),t&&t(),this.exchangeBusyPromise=null}})}decorateAppAPIMethods(e,t,n){for(let r of t)e[r]=this.decorateAppAPIMethod(r,e[r],e,n)}decorateAppAPIMethod(e,t,n,r){return(...o)=>m(this,void 0,void 0,function*(){let{_appAPIlock:i}=this;if(i)return Promise.reject(new u.TransportError("Ledger Device is busy (lock "+i+")","TransportLocked"));try{return this._appAPIlock=e,this.setScrambleKey(r),yield t.apply(n,o)}finally{this._appAPIlock=null}})}setTraceContext(e){this.tracer=this.tracer.withContext(e)}updateTraceContext(e){this.tracer.updateContext(e)}getTraceContext(){return this.tracer.getContext()}}y.ErrorMessage_ListenTimeout="No Ledger device found (timeout)",y.ErrorMessage_NoDeviceFound="No Ledger device found";var w=n(94473),b=n(29632),x=n.n(b),S=function(){return(S=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e}).apply(this,arguments)};(r=c||(c={})).blue="blue",r.nanoS="nanoS",r.nanoSP="nanoSP",r.nanoX="nanoX",r.nanoFTS="nanoFTS";var T=((i={})[c.blue]={id:c.blue,productName:"Ledger\xa0Blue",productIdMM:0,legacyUsbProductId:0,usbOnly:!0,memorySize:491520,masks:[822083584,822149120],getBlockSize:function(e){return 4096}},i[c.nanoS]={id:c.nanoS,productName:"Ledger\xa0Nano\xa0S",productIdMM:16,legacyUsbProductId:1,usbOnly:!0,memorySize:327680,masks:[823132160],getBlockSize:function(e){var t;return x().lt(null!==(t=x().coerce(e))&&void 0!==t?t:"","2.0.0")?4096:2048}},i[c.nanoSP]={id:c.nanoSP,productName:"Ledger Nano S Plus",productIdMM:80,legacyUsbProductId:5,usbOnly:!0,memorySize:1572864,masks:[856686592],getBlockSize:function(e){return 32}},i[c.nanoX]={id:c.nanoX,productName:"Ledger\xa0Nano\xa0X",productIdMM:64,legacyUsbProductId:4,usbOnly:!1,memorySize:2097152,masks:[855638016],getBlockSize:function(e){return 4096},bluetoothSpec:[{serviceUuid:"13d63400-2c97-0004-0000-4c6564676572",notifyUuid:"13d63400-2c97-0004-0001-4c6564676572",writeUuid:"13d63400-2c97-0004-0002-4c6564676572",writeCmdUuid:"13d63400-2c97-0004-0003-4c6564676572"}]},i[c.nanoFTS]={id:c.nanoFTS,productName:"Ledger\xa0Nano\xa0FTS",productIdMM:96,legacyUsbProductId:6,usbOnly:!1,memorySize:2097152,masks:[857735168],getBlockSize:function(e){return 4096},bluetoothSpec:[{serviceUuid:"13d63400-2c97-6004-0000-4c6564676572",notifyUuid:"13d63400-2c97-6004-0001-4c6564676572",writeUuid:"13d63400-2c97-6004-0002-4c6564676572",writeCmdUuid:"13d63400-2c97-6004-0003-4c6564676572"}]},i);c.blue,c.nanoS,c.nanoSP,c.nanoX,c.nanoFTS;var I=Object.values(T),E=function(e){var t=I.find(function(t){return t.legacyUsbProductId===e});if(t)return t;var n=e>>8;return I.find(function(e){return e.productIdMM===n})},P=[],k={};for(var U in T){var _=T[U],C=_.bluetoothSpec;if(C)for(var M=0;M<C.length;M++){var L=C[M];P.push(L.serviceUuid),k[L.serviceUuid]=k[L.serviceUuid.replace(/-/g,"")]=S({deviceModel:_},L)}}var B=n(46385).Buffer,O=(o=function(e,t){return(o=Object.setPrototypeOf||({__proto__:[]})instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])})(e,t)},function(e,t){if("function"!=typeof t&&null!==t)throw TypeError("Class extends value "+String(t)+" is not a constructor or null");function n(){this.constructor=e}o(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),D=function(e,t,n,r){return new(n||(n=Promise))(function(o,i){function c(e){try{a(r.next(e))}catch(e){i(e)}}function s(e){try{a(r.throw(e))}catch(e){i(e)}}function a(e){var t;e.done?o(e.value):((t=e.value)instanceof n?t:new n(function(e){e(t)})).then(c,s)}a((r=r.apply(e,t||[])).next())})},A=function(e,t){var n,r,o,i,c={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:s(0),throw:s(1),return:s(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function s(i){return function(s){return function(i){if(n)throw TypeError("Generator is already executing.");for(;c;)try{if(n=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return c.label++,{value:i[1],done:!1};case 5:c.label++,r=i[1],i=[0];continue;case 7:i=c.ops.pop(),c.trys.pop();continue;default:if(!(o=(o=c.trys).length>0&&o[o.length-1])&&(6===i[0]||2===i[0])){c=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){c.label=i[1];break}if(6===i[0]&&c.label<o[1]){c.label=o[1],o=i;break}if(o&&c.label<o[2]){c.label=o[2],c.ops.push(i);break}o[2]&&c.ops.pop(),c.trys.pop();continue}i=t.call(e,c)}catch(e){i=[6,e],r=0}finally{n=o=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,s])}}},N=function(e,t){var n="function"==typeof Symbol&&e[Symbol.iterator];if(!n)return e;var r,o,i=n.call(e),c=[];try{for(;(void 0===t||t-- >0)&&!(r=i.next()).done;)c.push(r.value)}catch(e){o={error:e}}finally{try{r&&!r.done&&(n=i.return)&&n.call(i)}finally{if(o)throw o.error}}return c},z=[{vendorId:11415}],R=function(){return Promise.resolve(!!(window.navigator&&window.navigator.hid))},j=function(){var e=navigator.hid;if(!e)throw new u.TransportError("navigator.hid is not supported","HIDNotSupported");return e};function F(){return D(this,void 0,void 0,function(){var e;return A(this,function(t){switch(t.label){case 0:return[4,j().requestDevice({filters:z})];case 1:if(Array.isArray(e=t.sent()))return[2,e];return[2,[e]]}})})}function q(){return D(this,void 0,void 0,function(){return A(this,function(e){switch(e.label){case 0:return[4,j().getDevices()];case 1:return[2,e.sent().filter(function(e){return 11415===e.vendorId})]}})})}var X=function(e){function t(t){var n=e.call(this)||this;return n.channel=Math.floor(65535*Math.random()),n.packetSize=64,n.inputs=[],n.read=function(){return n.inputs.length?Promise.resolve(n.inputs.shift()):new Promise(function(e){n.inputCallback=e})},n.onInputReport=function(e){var t=B.from(e.data.buffer);n.inputCallback?(n.inputCallback(t),n.inputCallback=null):n.inputs.push(t)},n._disconnectEmitted=!1,n._emitDisconnect=function(e){n._disconnectEmitted||(n._disconnectEmitted=!0,n.emit("disconnect",e))},n.exchange=function(e){return D(n,void 0,void 0,function(){var t=this;return A(this,function(n){switch(n.label){case 0:return[4,this.exchangeAtomicImpl(function(){return D(t,void 0,void 0,function(){var t,n,r,o,i,c,s,a,u;return A(this,function(l){switch(l.label){case 0:t=this,n=t.channel,r=t.packetSize,h("apdu","=> "+e.toString("hex")),i=(o=(0,w.Z)(n,r)).makeBlocks(e),c=0,l.label=1;case 1:if(!(c<i.length))return[3,4];return[4,this.device.sendReport(0,i[c])];case 2:l.sent(),l.label=3;case 3:return c++,[3,1];case 4:if(s=o.getReducedResult(a))return[3,6];return[4,this.read()];case 5:return u=l.sent(),a=o.reduceResponse(a,u),[3,4];case 6:return h("apdu","<= "+s.toString("hex")),[2,s]}})})}).catch(function(e){if(e&&e.message&&e.message.includes("write"))throw t._emitDisconnect(e),new u.DisconnectedDeviceDuringOperation(e.message);throw e})];case 1:return[2,n.sent()]}})})},n.device=t,n.deviceModel="number"==typeof t.productId?E(t.productId):void 0,t.addEventListener("inputreport",n.onInputReport),n}return O(t,e),t.request=function(){return D(this,void 0,void 0,function(){var e;return A(this,function(n){switch(n.label){case 0:return[4,F()];case 1:return e=N.apply(void 0,[n.sent(),1])[0],[2,t.open(e)]}})})},t.openConnected=function(){return D(this,void 0,void 0,function(){var e;return A(this,function(n){switch(n.label){case 0:return[4,q()];case 1:if(0===(e=n.sent()).length)return[2,null];return[2,t.open(e[0])]}})})},t.open=function(e){return D(this,void 0,void 0,function(){var n,r;return A(this,function(o){switch(o.label){case 0:return[4,e.open()];case 1:return o.sent(),n=new t(e),r=function(t){e===t.device&&(j().removeEventListener("disconnect",r),n._emitDisconnect(new u.DisconnectedDevice))},j().addEventListener("disconnect",r),[2,n]}})})},t.prototype.close=function(){return D(this,void 0,void 0,function(){return A(this,function(e){switch(e.label){case 0:return[4,this.exchangeBusyPromise];case 1:return e.sent(),this.device.removeEventListener("inputreport",this.onInputReport),[4,this.device.close()];case 2:return e.sent(),[2]}})})},t.prototype.setScrambleKey=function(){},t.isSupported=R,t.list=q,t.listen=function(e){var t=!1;return(function(){return D(this,void 0,void 0,function(){var e;return A(this,function(t){switch(t.label){case 0:return[4,q()];case 1:if((e=t.sent()).length>0)return[2,e[0]];return[4,F()];case 2:return[2,t.sent()[0]]}})})})().then(function(n){if(n){if(!t){var r="number"==typeof n.productId?E(n.productId):void 0;e.next({type:"add",descriptor:n,deviceModel:r}),e.complete()}}else e.error(new u.TransportOpenUserCancelled("Access denied to use Ledger device"))},function(t){e.error(new u.TransportOpenUserCancelled(t.message))}),{unsubscribe:function(){t=!0}}},t}(y)}}]);
//# sourceMappingURL=9182.7f6b029de6e88c2f.js.map