const CACHE='accerttech-v1'
const ASSETS=['./','./manifest.json','./icons/icon.svg']

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>
    Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
  ))
  self.clients.claim()
})

self.addEventListener('fetch',e=>{
  const url=e.request.url
  if(url.includes('firebase')||url.includes('googleapis')||url.includes('ipify')||url.includes('gstatic'))return
  e.respondWith(
    fetch(e.request).then(res=>{
      if(res&&res.status===200&&e.request.method==='GET'){
        const clone=res.clone()
        caches.open(CACHE).then(c=>c.put(e.request,clone))
      }
      return res
    }).catch(()=>caches.match(e.request))
  )
})

self.addEventListener('notificationclick',e=>{
  e.notification.close()
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
      for(const c of cs){
        if(c.url.includes('eletrica')&&'focus' in c){
          c.focus()
          c.postMessage({type:'openChat'})
          return
        }
      }
      return clients.openWindow('./')
    })
  )
})
