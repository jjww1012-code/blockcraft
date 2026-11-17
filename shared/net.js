// Spielehalle – gemeinsamer Online-Baustein (PeerJS, Raum-Code, Stern-Topologie: der Host verteilt alles)
// Nutzung:
//   const room = await Room.create('uno', {name})       -> room.code
//   const room = await Room.join('uno', 'ABCD', {name})
//   room.on('msg', (m, from) => ...)   room.on('peers', list => ...)   room.on('close', () => ...)
//   room.send(m)            // an alle (Host verteilt)
//   room.sendTo(id, m)      // an einen Spieler (nur Host)
//   room.isHost, room.id, room.peers = [{id,name,...}]
(function () {
  'use strict';
  const LS = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  function peerOpts() {
    const o = { debug: 0, config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] } };
    const q = new URLSearchParams(location.search).get('peer');
    if (q) { const [h, p] = q.split(':'); Object.assign(o, { host: h, port: +p, path: '/', secure: false }); }
    return o;
  }
  const SITE = location.host.replace(/[^a-z0-9]/gi, '').slice(0, 12);
  const pid = (game, code) => 'sh1-' + SITE + '-' + game + '-' + code;
  const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const newCode = () => Array.from({ length: 4 }, () => LETTERS[Math.random() * LETTERS.length | 0]).join('');
  let uid = LS.get('sh_uid'); if (!uid) { uid = Math.random().toString(36).slice(2, 10); LS.set('sh_uid', uid); }

  class Room {
    constructor(game) { this.game = game; this.h = {}; this.peers = []; this.conns = new Map(); this.isHost = false; this.id = uid; this.open = true; }
    on(ev, fn) { (this.h[ev] = this.h[ev] || []).push(fn); return this; }
    emit(ev, ...a) { for (const f of this.h[ev] || []) try { f(...a); } catch (e) { console.error(e); } }
    // ---- Host ----
    static create(game, info, maxPlayers = 8) {
      return new Promise((res, rej) => {
        if (typeof Peer === 'undefined') return rej(new Error('Online nicht verfügbar'));
        const r = new Room(game); r.isHost = true; r.info = info; r.max = maxPlayers;
        let tries = 0;
        const go = () => {
          r.code = newCode(); const p = new Peer(pid(game, r.code), peerOpts()); r.peer = p;
          p.on('open', () => { r.peers = [Object.assign({ id: uid, host: true }, info)]; res(r); });
          p.on('error', e => { if (e.type === 'unavailable-id' && tries++ < 5) { p.destroy(); go(); } else if (!r.peers.length) rej(e); else r.emit('error', e); });
          p.on('connection', c => r._accept(c));
          p.on('disconnected', () => { try { p.reconnect(); } catch (e) {} });
        };
        go();
      });
    }
    _accept(c) {
      c.on('open', () => {
        c.on('data', m => {
          if (m && m._hello) {
            if (this.locked || this.peers.length >= this.max) { c.send({ _full: 1 }); setTimeout(() => c.close(), 300); return; }
            c._id = m._hello.id; this.conns.set(c._id, c); this.peers = this.peers.filter(p => p.id !== c._id).concat([Object.assign({ id: c._id }, m._hello.info)]);
            c.send({ _welcome: { you: c._id, peers: this.peers } }); this._peers(); return;
          }
          if (!c._id) return;
          if (m && m._to) { const t = this.conns.get(m._to); if (t) t.send({ _from: c._id, m: m.m }); else if (m._to === uid) this.emit('msg', m.m, c._id); return; }
          // an alle anderen weiterreichen und selbst verarbeiten
          for (const [id, o] of this.conns) if (id !== c._id && o.open) o.send({ _from: c._id, m });
          this.emit('msg', m, c._id);
        });
        c.on('close', () => { if (!c._id) return; this.conns.delete(c._id); this.peers = this.peers.filter(p => p.id !== c._id); this._peers(); this.emit('leave', c._id); });
      });
    }
    _peers() { for (const o of this.conns.values()) if (o.open) o.send({ _peers: this.peers }); this.emit('peers', this.peers); }
    setInfo(info) { const me = this.peers.find(p => p.id === uid); if (me) Object.assign(me, info); if (this.isHost) this._peers(); else this.conn && this.conn.send({ _info: info }); }
    // ---- Gast ----
    static join(game, code, info) {
      return new Promise((res, rej) => {
        if (typeof Peer === 'undefined') return rej(new Error('Online nicht verfügbar'));
        const r = new Room(game); r.code = code.toUpperCase(); const p = new Peer(peerOpts()); r.peer = p; let ok = false;
        const fail = t => { if (!ok) { ok = true; try { p.destroy(); } catch (e) {} rej(new Error(t)); } };
        setTimeout(() => fail('Raum nicht gefunden. Ist der Code richtig?'), 12000);
        p.on('error', e => fail(e.type === 'peer-unavailable' ? 'Raum nicht gefunden. Ist der Code richtig?' : 'Online-Fehler: ' + e.type));
        p.on('open', () => {
          const c = p.connect(pid(game, r.code), { reliable: true }); r.conn = c;
          c.on('open', () => c.send({ _hello: { id: uid, info } }));
          c.on('data', d => {
            if (d && d._full) return fail('Der Raum ist voll oder das Spiel läuft schon.');
            if (d && d._welcome) { ok = true; r.peers = d._welcome.peers; res(r); r.emit('peers', r.peers); return; }
            if (d && d._peers) { r.peers = d._peers; r.emit('peers', r.peers); return; }
            if (d && d._from !== undefined) r.emit('msg', d.m, d._from);
          });
          c.on('close', () => { if (r.open) { r.open = false; r.emit('close'); } });
        });
      });
    }
    send(m) {
      if (this.isHost) { for (const o of this.conns.values()) if (o.open) o.send({ _from: uid, m }); }
      else if (this.conn && this.conn.open) this.conn.send(m);
    }
    sendTo(id, m) {
      if (id === uid) { this.emit('msg', m, uid); return; }
      if (this.isHost) { const o = this.conns.get(id); if (o && o.open) o.send({ _from: uid, m }); }
      else if (this.conn && this.conn.open) this.conn.send({ _to: id, m });
    }
    leave() { this.open = false; try { if (this.conn) this.conn.close(); for (const c of this.conns.values()) c.close(); this.peer && this.peer.destroy(); } catch (e) {} }
  }
  // Name & Elo merken (gemeinsam für alle Spiele)
  const Profile = {
    get name() { return LS.get('sh_name') || LS.get('vg_name') || LS.get('bc2_name') || ''; },
    set name(v) { LS.set('sh_name', String(v).slice(0, 16)); },
    get(k, d) { const v = LS.get('sh_' + k); return v == null ? d : JSON.parse(v); },
    set(k, v) { LS.set('sh_' + k, JSON.stringify(v)); },
  };
  window.Room = Room; window.Profile = Profile; window.SH_UID = uid;
})();
