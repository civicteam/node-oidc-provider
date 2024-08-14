(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9632],{56640:function(e,r,t){let s=Symbol("SemVer ANY");class i{static get ANY(){return s}constructor(e,r){if(r=n(r),e instanceof i){if(!!r.loose===e.loose)return e;e=e.value}p("comparator",e=e.trim().split(/\s+/).join(" "),r),this.options=r,this.loose=!!r.loose,this.parse(e),this.semver===s?this.value="":this.value=this.operator+this.semver.version,p("comp",this)}parse(e){let r=this.options.loose?o[l.COMPARATORLOOSE]:o[l.COMPARATOR],t=e.match(r);if(!t)throw TypeError(`Invalid comparator: ${e}`);this.operator=void 0!==t[1]?t[1]:"","="===this.operator&&(this.operator=""),t[2]?this.semver=new E(t[2],this.options.loose):this.semver=s}toString(){return this.value}test(e){if(p("Comparator.test",e,this.options.loose),this.semver===s||e===s)return!0;if("string"==typeof e)try{e=new E(e,this.options)}catch(e){return!1}return a(e,this.operator,this.semver,this.options)}intersects(e,r){if(!(e instanceof i))throw TypeError("a Comparator is required");return""===this.operator?""===this.value||new h(e.value,r).test(this.value):""===e.operator?""===e.value||new h(this.value,r).test(e.semver):!((r=n(r)).includePrerelease&&("<0.0.0-0"===this.value||"<0.0.0-0"===e.value)||!r.includePrerelease&&(this.value.startsWith("<0.0.0")||e.value.startsWith("<0.0.0")))&&!!(this.operator.startsWith(">")&&e.operator.startsWith(">")||this.operator.startsWith("<")&&e.operator.startsWith("<")||this.semver.version===e.semver.version&&this.operator.includes("=")&&e.operator.includes("=")||a(this.semver,"<",e.semver,r)&&this.operator.startsWith(">")&&e.operator.startsWith("<")||a(this.semver,">",e.semver,r)&&this.operator.startsWith("<")&&e.operator.startsWith(">"))}}e.exports=i;let n=t(69843),{safeRe:o,t:l}=t(63721),a=t(12829),p=t(93471),E=t(69117),h=t(30650)},30650:function(e,r,t){class s{constructor(e,r){if(r=n(r),e instanceof s){if(!!r.loose===e.loose&&!!r.includePrerelease===e.includePrerelease)return e;return new s(e.raw,r)}if(e instanceof o)return this.raw=e.value,this.set=[[e]],this.format(),this;if(this.options=r,this.loose=!!r.loose,this.includePrerelease=!!r.includePrerelease,this.raw=e.trim().split(/\s+/).join(" "),this.set=this.raw.split("||").map(e=>this.parseRange(e.trim())).filter(e=>e.length),!this.set.length)throw TypeError(`Invalid SemVer Range: ${this.raw}`);if(this.set.length>1){let e=this.set[0];if(this.set=this.set.filter(e=>!m(e[0])),0===this.set.length)this.set=[e];else if(this.set.length>1){for(let e of this.set)if(1===e.length&&I(e[0])){this.set=[e];break}}}this.format()}format(){return this.range=this.set.map(e=>e.join(" ").trim()).join("||").trim(),this.range}toString(){return this.range}parseRange(e){let r=((this.options.includePrerelease&&f)|(this.options.loose&&$))+":"+e,t=i.get(r);if(t)return t;let s=this.options.loose,n=s?p[E.HYPHENRANGELOOSE]:p[E.HYPHENRANGE];l("hyphen replace",e=e.replace(n,P(this.options.includePrerelease))),l("comparator trim",e=e.replace(p[E.COMPARATORTRIM],h)),l("tilde trim",e=e.replace(p[E.TILDETRIM],u)),l("caret trim",e=e.replace(p[E.CARETTRIM],c));let a=e.split(" ").map(e=>L(e,this.options)).join(" ").split(/\s+/).map(e=>w(e,this.options));s&&(a=a.filter(e=>(l("loose invalid filter",e,this.options),!!e.match(p[E.COMPARATORLOOSE])))),l("range list",a);let I=new Map;for(let e of a.map(e=>new o(e,this.options))){if(m(e))return[e];I.set(e.value,e)}I.size>1&&I.has("")&&I.delete("");let R=[...I.values()];return i.set(r,R),R}intersects(e,r){if(!(e instanceof s))throw TypeError("a Range is required");return this.set.some(t=>R(t,r)&&e.set.some(e=>R(e,r)&&t.every(t=>e.every(e=>t.intersects(e,r)))))}test(e){if(!e)return!1;if("string"==typeof e)try{e=new a(e,this.options)}catch(e){return!1}for(let r=0;r<this.set.length;r++)if(C(this.set[r],e,this.options))return!0;return!1}}e.exports=s;let i=new(t(1985)),n=t(69843),o=t(56640),l=t(93471),a=t(69117),{safeRe:p,t:E,comparatorTrimReplace:h,tildeTrimReplace:u,caretTrimReplace:c}=t(63721),{FLAG_INCLUDE_PRERELEASE:f,FLAG_LOOSE:$}=t(61089),m=e=>"<0.0.0-0"===e.value,I=e=>""===e.value,R=(e,r)=>{let t=!0,s=e.slice(),i=s.pop();for(;t&&s.length;)t=s.every(e=>i.intersects(e,r)),i=s.pop();return t},L=(e,r)=>(l("comp",e,r),l("caret",e=A(e,r)),l("tildes",e=v(e,r)),l("xrange",e=d(e,r)),l("stars",e=g(e,r)),e),N=e=>!e||"x"===e.toLowerCase()||"*"===e,v=(e,r)=>e.trim().split(/\s+/).map(e=>O(e,r)).join(" "),O=(e,r)=>{let t=r.loose?p[E.TILDELOOSE]:p[E.TILDE];return e.replace(t,(r,t,s,i,n)=>{let o;return l("tilde",e,r,t,s,i,n),N(t)?o="":N(s)?o=`>=${t}.0.0 <${+t+1}.0.0-0`:N(i)?o=`>=${t}.${s}.0 <${t}.${+s+1}.0-0`:n?(l("replaceTilde pr",n),o=`>=${t}.${s}.${i}-${n} <${t}.${+s+1}.0-0`):o=`>=${t}.${s}.${i} <${t}.${+s+1}.0-0`,l("tilde return",o),o})},A=(e,r)=>e.trim().split(/\s+/).map(e=>T(e,r)).join(" "),T=(e,r)=>{l("caret",e,r);let t=r.loose?p[E.CARETLOOSE]:p[E.CARET],s=r.includePrerelease?"-0":"";return e.replace(t,(r,t,i,n,o)=>{let a;return l("caret",e,r,t,i,n,o),N(t)?a="":N(i)?a=`>=${t}.0.0${s} <${+t+1}.0.0-0`:N(n)?a="0"===t?`>=${t}.${i}.0${s} <${t}.${+i+1}.0-0`:`>=${t}.${i}.0${s} <${+t+1}.0.0-0`:o?(l("replaceCaret pr",o),a="0"===t?"0"===i?`>=${t}.${i}.${n}-${o} <${t}.${i}.${+n+1}-0`:`>=${t}.${i}.${n}-${o} <${t}.${+i+1}.0-0`:`>=${t}.${i}.${n}-${o} <${+t+1}.0.0-0`):(l("no pr"),a="0"===t?"0"===i?`>=${t}.${i}.${n}${s} <${t}.${i}.${+n+1}-0`:`>=${t}.${i}.${n}${s} <${t}.${+i+1}.0-0`:`>=${t}.${i}.${n} <${+t+1}.0.0-0`),l("caret return",a),a})},d=(e,r)=>(l("replaceXRanges",e,r),e.split(/\s+/).map(e=>S(e,r)).join(" ")),S=(e,r)=>{e=e.trim();let t=r.loose?p[E.XRANGELOOSE]:p[E.XRANGE];return e.replace(t,(t,s,i,n,o,a)=>{l("xRange",e,t,s,i,n,o,a);let p=N(i),E=p||N(n),h=E||N(o);return"="===s&&h&&(s=""),a=r.includePrerelease?"-0":"",p?t=">"===s||"<"===s?"<0.0.0-0":"*":s&&h?(E&&(n=0),o=0,">"===s?(s=">=",E?(i=+i+1,n=0):n=+n+1,o=0):"<="===s&&(s="<",E?i=+i+1:n=+n+1),"<"===s&&(a="-0"),t=`${s+i}.${n}.${o}${a}`):E?t=`>=${i}.0.0${a} <${+i+1}.0.0-0`:h&&(t=`>=${i}.${n}.0${a} <${i}.${+n+1}.0-0`),l("xRange return",t),t})},g=(e,r)=>(l("replaceStars",e,r),e.trim().replace(p[E.STAR],"")),w=(e,r)=>(l("replaceGTE0",e,r),e.trim().replace(p[r.includePrerelease?E.GTE0PRE:E.GTE0],"")),P=e=>(r,t,s,i,n,o,l,a,p,E,h,u)=>(t=N(s)?"":N(i)?`>=${s}.0.0${e?"-0":""}`:N(n)?`>=${s}.${i}.0${e?"-0":""}`:o?`>=${t}`:`>=${t}${e?"-0":""}`,a=N(p)?"":N(E)?`<${+p+1}.0.0-0`:N(h)?`<${p}.${+E+1}.0-0`:u?`<=${p}.${E}.${h}-${u}`:e?`<${p}.${E}.${+h+1}-0`:`<=${a}`,`${t} ${a}`.trim()),C=(e,r,t)=>{for(let t=0;t<e.length;t++)if(!e[t].test(r))return!1;if(r.prerelease.length&&!t.includePrerelease){for(let t=0;t<e.length;t++)if(l(e[t].semver),e[t].semver!==o.ANY&&e[t].semver.prerelease.length>0){let s=e[t].semver;if(s.major===r.major&&s.minor===r.minor&&s.patch===r.patch)return!0}return!1}return!0}},69117:function(e,r,t){let s=t(93471),{MAX_LENGTH:i,MAX_SAFE_INTEGER:n}=t(61089),{safeRe:o,t:l}=t(63721),a=t(69843),{compareIdentifiers:p}=t(37472);class E{constructor(e,r){if(r=a(r),e instanceof E){if(!!r.loose===e.loose&&!!r.includePrerelease===e.includePrerelease)return e;e=e.version}else if("string"!=typeof e)throw TypeError(`Invalid version. Must be a string. Got type "${typeof e}".`);if(e.length>i)throw TypeError(`version is longer than ${i} characters`);s("SemVer",e,r),this.options=r,this.loose=!!r.loose,this.includePrerelease=!!r.includePrerelease;let t=e.trim().match(r.loose?o[l.LOOSE]:o[l.FULL]);if(!t)throw TypeError(`Invalid Version: ${e}`);if(this.raw=e,this.major=+t[1],this.minor=+t[2],this.patch=+t[3],this.major>n||this.major<0)throw TypeError("Invalid major version");if(this.minor>n||this.minor<0)throw TypeError("Invalid minor version");if(this.patch>n||this.patch<0)throw TypeError("Invalid patch version");t[4]?this.prerelease=t[4].split(".").map(e=>{if(/^[0-9]+$/.test(e)){let r=+e;if(r>=0&&r<n)return r}return e}):this.prerelease=[],this.build=t[5]?t[5].split("."):[],this.format()}format(){return this.version=`${this.major}.${this.minor}.${this.patch}`,this.prerelease.length&&(this.version+=`-${this.prerelease.join(".")}`),this.version}toString(){return this.version}compare(e){if(s("SemVer.compare",this.version,this.options,e),!(e instanceof E)){if("string"==typeof e&&e===this.version)return 0;e=new E(e,this.options)}return e.version===this.version?0:this.compareMain(e)||this.comparePre(e)}compareMain(e){return e instanceof E||(e=new E(e,this.options)),p(this.major,e.major)||p(this.minor,e.minor)||p(this.patch,e.patch)}comparePre(e){if(e instanceof E||(e=new E(e,this.options)),this.prerelease.length&&!e.prerelease.length)return -1;if(!this.prerelease.length&&e.prerelease.length)return 1;if(!this.prerelease.length&&!e.prerelease.length)return 0;let r=0;do{let t=this.prerelease[r],i=e.prerelease[r];if(s("prerelease compare",r,t,i),void 0===t&&void 0===i)return 0;if(void 0===i)return 1;if(void 0===t)return -1;if(t===i)continue;else return p(t,i)}while(++r)}compareBuild(e){e instanceof E||(e=new E(e,this.options));let r=0;do{let t=this.build[r],i=e.build[r];if(s("build compare",r,t,i),void 0===t&&void 0===i)return 0;if(void 0===i)return 1;if(void 0===t)return -1;if(t===i)continue;else return p(t,i)}while(++r)}inc(e,r,t){switch(e){case"premajor":this.prerelease.length=0,this.patch=0,this.minor=0,this.major++,this.inc("pre",r,t);break;case"preminor":this.prerelease.length=0,this.patch=0,this.minor++,this.inc("pre",r,t);break;case"prepatch":this.prerelease.length=0,this.inc("patch",r,t),this.inc("pre",r,t);break;case"prerelease":0===this.prerelease.length&&this.inc("patch",r,t),this.inc("pre",r,t);break;case"major":(0!==this.minor||0!==this.patch||0===this.prerelease.length)&&this.major++,this.minor=0,this.patch=0,this.prerelease=[];break;case"minor":(0!==this.patch||0===this.prerelease.length)&&this.minor++,this.patch=0,this.prerelease=[];break;case"patch":0===this.prerelease.length&&this.patch++,this.prerelease=[];break;case"pre":{let e=Number(t)?1:0;if(!r&&!1===t)throw Error("invalid increment argument: identifier is empty");if(0===this.prerelease.length)this.prerelease=[e];else{let s=this.prerelease.length;for(;--s>=0;)"number"==typeof this.prerelease[s]&&(this.prerelease[s]++,s=-2);if(-1===s){if(r===this.prerelease.join(".")&&!1===t)throw Error("invalid increment argument: identifier already exists");this.prerelease.push(e)}}if(r){let s=[r,e];!1===t&&(s=[r]),0===p(this.prerelease[0],r)?isNaN(this.prerelease[1])&&(this.prerelease=s):this.prerelease=s}break}default:throw Error(`invalid increment argument: ${e}`)}return this.raw=this.format(),this.build.length&&(this.raw+=`+${this.build.join(".")}`),this}}e.exports=E},86247:function(e,r,t){let s=t(72825);e.exports=(e,r)=>{let t=s(e.trim().replace(/^[=v]+/,""),r);return t?t.version:null}},12829:function(e,r,t){let s=t(68298),i=t(56746),n=t(85001),o=t(17768),l=t(73031),a=t(74457);e.exports=(e,r,t,p)=>{switch(r){case"===":return"object"==typeof e&&(e=e.version),"object"==typeof t&&(t=t.version),e===t;case"!==":return"object"==typeof e&&(e=e.version),"object"==typeof t&&(t=t.version),e!==t;case"":case"=":case"==":return s(e,t,p);case"!=":return i(e,t,p);case">":return n(e,t,p);case">=":return o(e,t,p);case"<":return l(e,t,p);case"<=":return a(e,t,p);default:throw TypeError(`Invalid operator: ${r}`)}}},87153:function(e,r,t){let s=t(69117),i=t(72825),{safeRe:n,t:o}=t(63721);e.exports=(e,r)=>{if(e instanceof s)return e;if("number"==typeof e&&(e=String(e)),"string"!=typeof e)return null;let t=null;if((r=r||{}).rtl){let s;let i=r.includePrerelease?n[o.COERCERTLFULL]:n[o.COERCERTL];for(;(s=i.exec(e))&&(!t||t.index+t[0].length!==e.length);)t&&s.index+s[0].length===t.index+t[0].length||(t=s),i.lastIndex=s.index+s[1].length+s[2].length;i.lastIndex=-1}else t=e.match(r.includePrerelease?n[o.COERCEFULL]:n[o.COERCE]);if(null===t)return null;let l=t[2],a=t[3]||"0",p=t[4]||"0",E=r.includePrerelease&&t[5]?`-${t[5]}`:"",h=r.includePrerelease&&t[6]?`+${t[6]}`:"";return i(`${l}.${a}.${p}${E}${h}`,r)}},51293:function(e,r,t){let s=t(69117);e.exports=(e,r,t)=>{let i=new s(e,t),n=new s(r,t);return i.compare(n)||i.compareBuild(n)}},72114:function(e,r,t){let s=t(10056);e.exports=(e,r)=>s(e,r,!0)},10056:function(e,r,t){let s=t(69117);e.exports=(e,r,t)=>new s(e,t).compare(new s(r,t))},77925:function(e,r,t){let s=t(72825);e.exports=(e,r)=>{let t=s(e,null,!0),i=s(r,null,!0),n=t.compare(i);if(0===n)return null;let o=n>0,l=o?t:i,a=o?i:t,p=!!l.prerelease.length;if(a.prerelease.length&&!p)return a.patch||a.minor?l.patch?"patch":l.minor?"minor":"major":"major";let E=p?"pre":"";return t.major!==i.major?E+"major":t.minor!==i.minor?E+"minor":t.patch!==i.patch?E+"patch":"prerelease"}},68298:function(e,r,t){let s=t(10056);e.exports=(e,r,t)=>0===s(e,r,t)},85001:function(e,r,t){let s=t(10056);e.exports=(e,r,t)=>s(e,r,t)>0},17768:function(e,r,t){let s=t(10056);e.exports=(e,r,t)=>s(e,r,t)>=0},36633:function(e,r,t){let s=t(69117);e.exports=(e,r,t,i,n)=>{"string"==typeof t&&(n=i,i=t,t=void 0);try{return new s(e instanceof s?e.version:e,t).inc(r,i,n).version}catch(e){return null}}},73031:function(e,r,t){let s=t(10056);e.exports=(e,r,t)=>0>s(e,r,t)},74457:function(e,r,t){let s=t(10056);e.exports=(e,r,t)=>0>=s(e,r,t)},99974:function(e,r,t){let s=t(69117);e.exports=(e,r)=>new s(e,r).major},18353:function(e,r,t){let s=t(69117);e.exports=(e,r)=>new s(e,r).minor},56746:function(e,r,t){let s=t(10056);e.exports=(e,r,t)=>0!==s(e,r,t)},72825:function(e,r,t){let s=t(69117);e.exports=(e,r,t=!1)=>{if(e instanceof s)return e;try{return new s(e,r)}catch(e){if(!t)return null;throw e}}},16026:function(e,r,t){let s=t(69117);e.exports=(e,r)=>new s(e,r).patch},43614:function(e,r,t){let s=t(72825);e.exports=(e,r)=>{let t=s(e,r);return t&&t.prerelease.length?t.prerelease:null}},36337:function(e,r,t){let s=t(10056);e.exports=(e,r,t)=>s(r,e,t)},93506:function(e,r,t){let s=t(51293);e.exports=(e,r)=>e.sort((e,t)=>s(t,e,r))},17149:function(e,r,t){let s=t(30650);e.exports=(e,r,t)=>{try{r=new s(r,t)}catch(e){return!1}return r.test(e)}},9026:function(e,r,t){let s=t(51293);e.exports=(e,r)=>e.sort((e,t)=>s(e,t,r))},52624:function(e,r,t){let s=t(72825);e.exports=(e,r)=>{let t=s(e,r);return t?t.version:null}},29632:function(e,r,t){let s=t(63721),i=t(61089),n=t(69117),o=t(37472),l=t(72825),a=t(52624),p=t(86247),E=t(36633),h=t(77925),u=t(99974),c=t(18353),f=t(16026),$=t(43614),m=t(10056),I=t(36337),R=t(72114),L=t(51293),N=t(9026),v=t(93506),O=t(85001),A=t(73031),T=t(68298),d=t(56746),S=t(17768),g=t(74457),w=t(12829),P=t(87153),C=t(56640),x=t(30650),D=t(17149),G=t(19268),j=t(2474),F=t(3110),M=t(92636),y=t(15207),U=t(17111),b=t(53874),X=t(70369),_=t(87314),k=t(32325),V=t(90807);e.exports={parse:l,valid:a,clean:p,inc:E,diff:h,major:u,minor:c,patch:f,prerelease:$,compare:m,rcompare:I,compareLoose:R,compareBuild:L,sort:N,rsort:v,gt:O,lt:A,eq:T,neq:d,gte:S,lte:g,cmp:w,coerce:P,Comparator:C,Range:x,satisfies:D,toComparators:G,maxSatisfying:j,minSatisfying:F,minVersion:M,validRange:y,outside:U,gtr:b,ltr:X,intersects:_,simplifyRange:k,subset:V,SemVer:n,re:s.re,src:s.src,tokens:s.t,SEMVER_SPEC_VERSION:i.SEMVER_SPEC_VERSION,RELEASE_TYPES:i.RELEASE_TYPES,compareIdentifiers:o.compareIdentifiers,rcompareIdentifiers:o.rcompareIdentifiers}},61089:function(e){let r=Number.MAX_SAFE_INTEGER||9007199254740991;e.exports={MAX_LENGTH:256,MAX_SAFE_COMPONENT_LENGTH:16,MAX_SAFE_BUILD_LENGTH:250,MAX_SAFE_INTEGER:r,RELEASE_TYPES:["major","premajor","minor","preminor","patch","prepatch","prerelease"],SEMVER_SPEC_VERSION:"2.0.0",FLAG_INCLUDE_PRERELEASE:1,FLAG_LOOSE:2}},93471:function(e,r,t){var s=t(68571);let i="object"==typeof s&&s.env&&s.env.NODE_DEBUG&&/\bsemver\b/i.test(s.env.NODE_DEBUG)?(...e)=>console.error("SEMVER",...e):()=>{};e.exports=i},37472:function(e){let r=/^[0-9]+$/,t=(e,t)=>{let s=r.test(e),i=r.test(t);return s&&i&&(e=+e,t=+t),e===t?0:s&&!i?-1:i&&!s?1:e<t?-1:1};e.exports={compareIdentifiers:t,rcompareIdentifiers:(e,r)=>t(r,e)}},1985:function(e){class r{constructor(){this.max=1e3,this.map=new Map}get(e){let r=this.map.get(e);if(void 0!==r)return this.map.delete(e),this.map.set(e,r),r}delete(e){return this.map.delete(e)}set(e,r){if(!this.delete(e)&&void 0!==r){if(this.map.size>=this.max){let e=this.map.keys().next().value;this.delete(e)}this.map.set(e,r)}return this}}e.exports=r},69843:function(e){let r=Object.freeze({loose:!0}),t=Object.freeze({});e.exports=e=>e?"object"!=typeof e?r:e:t},63721:function(e,r,t){let{MAX_SAFE_COMPONENT_LENGTH:s,MAX_SAFE_BUILD_LENGTH:i,MAX_LENGTH:n}=t(61089),o=t(93471),l=(r=e.exports={}).re=[],a=r.safeRe=[],p=r.src=[],E=r.t={},h=0,u="[a-zA-Z0-9-]",c=[["\\s",1],["\\d",n],[u,i]],f=e=>{for(let[r,t]of c)e=e.split(`${r}*`).join(`${r}{0,${t}}`).split(`${r}+`).join(`${r}{1,${t}}`);return e},$=(e,r,t)=>{let s=f(r),i=h++;o(e,i,r),E[e]=i,p[i]=r,l[i]=new RegExp(r,t?"g":void 0),a[i]=new RegExp(s,t?"g":void 0)};$("NUMERICIDENTIFIER","0|[1-9]\\d*"),$("NUMERICIDENTIFIERLOOSE","\\d+"),$("NONNUMERICIDENTIFIER",`\\d*[a-zA-Z-]${u}*`),$("MAINVERSION",`(${p[E.NUMERICIDENTIFIER]})\\.(${p[E.NUMERICIDENTIFIER]})\\.(${p[E.NUMERICIDENTIFIER]})`),$("MAINVERSIONLOOSE",`(${p[E.NUMERICIDENTIFIERLOOSE]})\\.(${p[E.NUMERICIDENTIFIERLOOSE]})\\.(${p[E.NUMERICIDENTIFIERLOOSE]})`),$("PRERELEASEIDENTIFIER",`(?:${p[E.NUMERICIDENTIFIER]}|${p[E.NONNUMERICIDENTIFIER]})`),$("PRERELEASEIDENTIFIERLOOSE",`(?:${p[E.NUMERICIDENTIFIERLOOSE]}|${p[E.NONNUMERICIDENTIFIER]})`),$("PRERELEASE",`(?:-(${p[E.PRERELEASEIDENTIFIER]}(?:\\.${p[E.PRERELEASEIDENTIFIER]})*))`),$("PRERELEASELOOSE",`(?:-?(${p[E.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${p[E.PRERELEASEIDENTIFIERLOOSE]})*))`),$("BUILDIDENTIFIER",`${u}+`),$("BUILD",`(?:\\+(${p[E.BUILDIDENTIFIER]}(?:\\.${p[E.BUILDIDENTIFIER]})*))`),$("FULLPLAIN",`v?${p[E.MAINVERSION]}${p[E.PRERELEASE]}?${p[E.BUILD]}?`),$("FULL",`^${p[E.FULLPLAIN]}$`),$("LOOSEPLAIN",`[v=\\s]*${p[E.MAINVERSIONLOOSE]}${p[E.PRERELEASELOOSE]}?${p[E.BUILD]}?`),$("LOOSE",`^${p[E.LOOSEPLAIN]}$`),$("GTLT","((?:<|>)?=?)"),$("XRANGEIDENTIFIERLOOSE",`${p[E.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`),$("XRANGEIDENTIFIER",`${p[E.NUMERICIDENTIFIER]}|x|X|\\*`),$("XRANGEPLAIN",`[v=\\s]*(${p[E.XRANGEIDENTIFIER]})(?:\\.(${p[E.XRANGEIDENTIFIER]})(?:\\.(${p[E.XRANGEIDENTIFIER]})(?:${p[E.PRERELEASE]})?${p[E.BUILD]}?)?)?`),$("XRANGEPLAINLOOSE",`[v=\\s]*(${p[E.XRANGEIDENTIFIERLOOSE]})(?:\\.(${p[E.XRANGEIDENTIFIERLOOSE]})(?:\\.(${p[E.XRANGEIDENTIFIERLOOSE]})(?:${p[E.PRERELEASELOOSE]})?${p[E.BUILD]}?)?)?`),$("XRANGE",`^${p[E.GTLT]}\\s*${p[E.XRANGEPLAIN]}$`),$("XRANGELOOSE",`^${p[E.GTLT]}\\s*${p[E.XRANGEPLAINLOOSE]}$`),$("COERCEPLAIN",`(^|[^\\d])(\\d{1,${s}})(?:\\.(\\d{1,${s}}))?(?:\\.(\\d{1,${s}}))?`),$("COERCE",`${p[E.COERCEPLAIN]}(?:$|[^\\d])`),$("COERCEFULL",p[E.COERCEPLAIN]+`(?:${p[E.PRERELEASE]})?`+`(?:${p[E.BUILD]})?`+"(?:$|[^\\d])"),$("COERCERTL",p[E.COERCE],!0),$("COERCERTLFULL",p[E.COERCEFULL],!0),$("LONETILDE","(?:~>?)"),$("TILDETRIM",`(\\s*)${p[E.LONETILDE]}\\s+`,!0),r.tildeTrimReplace="$1~",$("TILDE",`^${p[E.LONETILDE]}${p[E.XRANGEPLAIN]}$`),$("TILDELOOSE",`^${p[E.LONETILDE]}${p[E.XRANGEPLAINLOOSE]}$`),$("LONECARET","(?:\\^)"),$("CARETTRIM",`(\\s*)${p[E.LONECARET]}\\s+`,!0),r.caretTrimReplace="$1^",$("CARET",`^${p[E.LONECARET]}${p[E.XRANGEPLAIN]}$`),$("CARETLOOSE",`^${p[E.LONECARET]}${p[E.XRANGEPLAINLOOSE]}$`),$("COMPARATORLOOSE",`^${p[E.GTLT]}\\s*(${p[E.LOOSEPLAIN]})$|^$`),$("COMPARATOR",`^${p[E.GTLT]}\\s*(${p[E.FULLPLAIN]})$|^$`),$("COMPARATORTRIM",`(\\s*)${p[E.GTLT]}\\s*(${p[E.LOOSEPLAIN]}|${p[E.XRANGEPLAIN]})`,!0),r.comparatorTrimReplace="$1$2$3",$("HYPHENRANGE",`^\\s*(${p[E.XRANGEPLAIN]})\\s+-\\s+(${p[E.XRANGEPLAIN]})\\s*$`),$("HYPHENRANGELOOSE",`^\\s*(${p[E.XRANGEPLAINLOOSE]})\\s+-\\s+(${p[E.XRANGEPLAINLOOSE]})\\s*$`),$("STAR","(<|>)?=?\\s*\\*"),$("GTE0","^\\s*>=\\s*0\\.0\\.0\\s*$"),$("GTE0PRE","^\\s*>=\\s*0\\.0\\.0-0\\s*$")},53874:function(e,r,t){let s=t(17111);e.exports=(e,r,t)=>s(e,r,">",t)},87314:function(e,r,t){let s=t(30650);e.exports=(e,r,t)=>(e=new s(e,t),r=new s(r,t),e.intersects(r,t))},70369:function(e,r,t){let s=t(17111);e.exports=(e,r,t)=>s(e,r,"<",t)},2474:function(e,r,t){let s=t(69117),i=t(30650);e.exports=(e,r,t)=>{let n=null,o=null,l=null;try{l=new i(r,t)}catch(e){return null}return e.forEach(e=>{l.test(e)&&(!n||-1===o.compare(e))&&(o=new s(n=e,t))}),n}},3110:function(e,r,t){let s=t(69117),i=t(30650);e.exports=(e,r,t)=>{let n=null,o=null,l=null;try{l=new i(r,t)}catch(e){return null}return e.forEach(e=>{l.test(e)&&(!n||1===o.compare(e))&&(o=new s(n=e,t))}),n}},92636:function(e,r,t){let s=t(69117),i=t(30650),n=t(85001);e.exports=(e,r)=>{e=new i(e,r);let t=new s("0.0.0");if(e.test(t)||(t=new s("0.0.0-0"),e.test(t)))return t;t=null;for(let r=0;r<e.set.length;++r){let i=e.set[r],o=null;i.forEach(e=>{let r=new s(e.semver.version);switch(e.operator){case">":0===r.prerelease.length?r.patch++:r.prerelease.push(0),r.raw=r.format();case"":case">=":(!o||n(r,o))&&(o=r);break;case"<":case"<=":break;default:throw Error(`Unexpected operation: ${e.operator}`)}}),o&&(!t||n(t,o))&&(t=o)}return t&&e.test(t)?t:null}},17111:function(e,r,t){let s=t(69117),i=t(56640),{ANY:n}=i,o=t(30650),l=t(17149),a=t(85001),p=t(73031),E=t(74457),h=t(17768);e.exports=(e,r,t,u)=>{let c,f,$,m,I;switch(e=new s(e,u),r=new o(r,u),t){case">":c=a,f=E,$=p,m=">",I=">=";break;case"<":c=p,f=h,$=a,m="<",I="<=";break;default:throw TypeError('Must provide a hilo val of "<" or ">"')}if(l(e,r,u))return!1;for(let t=0;t<r.set.length;++t){let s=r.set[t],o=null,l=null;if(s.forEach(e=>{e.semver===n&&(e=new i(">=0.0.0")),o=o||e,l=l||e,c(e.semver,o.semver,u)?o=e:$(e.semver,l.semver,u)&&(l=e)}),o.operator===m||o.operator===I||(!l.operator||l.operator===m)&&f(e,l.semver)||l.operator===I&&$(e,l.semver))return!1}return!0}},32325:function(e,r,t){let s=t(17149),i=t(10056);e.exports=(e,r,t)=>{let n=[],o=null,l=null,a=e.sort((e,r)=>i(e,r,t));for(let e of a)s(e,r,t)?(l=e,o||(o=e)):(l&&n.push([o,l]),l=null,o=null);o&&n.push([o,null]);let p=[];for(let[e,r]of n)e===r?p.push(e):r||e!==a[0]?r?e===a[0]?p.push(`<=${r}`):p.push(`${e} - ${r}`):p.push(`>=${e}`):p.push("*");let E=p.join(" || "),h="string"==typeof r.raw?r.raw:String(r);return E.length<h.length?E:r}},90807:function(e,r,t){let s=t(30650),i=t(56640),{ANY:n}=i,o=t(17149),l=t(10056),a=[new i(">=0.0.0-0")],p=[new i(">=0.0.0")],E=(e,r,t)=>{let s,i,E,c,f,$,m;if(e===r)return!0;if(1===e.length&&e[0].semver===n){if(1===r.length&&r[0].semver===n)return!0;e=t.includePrerelease?a:p}if(1===r.length&&r[0].semver===n){if(t.includePrerelease)return!0;r=p}let I=new Set;for(let r of e)">"===r.operator||">="===r.operator?s=h(s,r,t):"<"===r.operator||"<="===r.operator?i=u(i,r,t):I.add(r.semver);if(I.size>1||s&&i&&((E=l(s.semver,i.semver,t))>0||0===E&&(">="!==s.operator||"<="!==i.operator)))return null;for(let e of I){if(s&&!o(e,String(s),t)||i&&!o(e,String(i),t))return null;for(let s of r)if(!o(e,String(s),t))return!1;return!0}let R=!!i&&!t.includePrerelease&&!!i.semver.prerelease.length&&i.semver,L=!!s&&!t.includePrerelease&&!!s.semver.prerelease.length&&s.semver;for(let e of(R&&1===R.prerelease.length&&"<"===i.operator&&0===R.prerelease[0]&&(R=!1),r)){if(m=m||">"===e.operator||">="===e.operator,$=$||"<"===e.operator||"<="===e.operator,s){if(L&&e.semver.prerelease&&e.semver.prerelease.length&&e.semver.major===L.major&&e.semver.minor===L.minor&&e.semver.patch===L.patch&&(L=!1),">"===e.operator||">="===e.operator){if((c=h(s,e,t))===e&&c!==s)return!1}else if(">="===s.operator&&!o(s.semver,String(e),t))return!1}if(i){if(R&&e.semver.prerelease&&e.semver.prerelease.length&&e.semver.major===R.major&&e.semver.minor===R.minor&&e.semver.patch===R.patch&&(R=!1),"<"===e.operator||"<="===e.operator){if((f=u(i,e,t))===e&&f!==i)return!1}else if("<="===i.operator&&!o(i.semver,String(e),t))return!1}if(!e.operator&&(i||s)&&0!==E)return!1}return(!s||!$||!!i||0===E)&&(!i||!m||!!s||0===E)&&!L&&!R},h=(e,r,t)=>{if(!e)return r;let s=l(e.semver,r.semver,t);return s>0?e:s<0?r:">"===r.operator&&">="===e.operator?r:e},u=(e,r,t)=>{if(!e)return r;let s=l(e.semver,r.semver,t);return s<0?e:s>0?r:"<"===r.operator&&"<="===e.operator?r:e};e.exports=(e,r,t={})=>{if(e===r)return!0;e=new s(e,t),r=new s(r,t);let i=!1;e:for(let s of e.set){for(let e of r.set){let r=E(s,e,t);if(i=i||null!==r,r)continue e}if(i)return!1}return!0}},19268:function(e,r,t){let s=t(30650);e.exports=(e,r)=>new s(e,r).set.map(e=>e.map(e=>e.value).join(" ").trim().split(" "))},15207:function(e,r,t){let s=t(30650);e.exports=(e,r)=>{try{return new s(e,r).range||"*"}catch(e){return null}}}}]);
//# sourceMappingURL=9632.7a2c4adae3b97416.js.map