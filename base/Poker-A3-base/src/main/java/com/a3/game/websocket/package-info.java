/**
 * WebSocket 接入：连接、事件分发与推送。
 * 只把消息交给 RoomService，不判断牌型。
 *
 * 上行：{"id":"1","event":"room:create","data":{}}
 * 应答：{"event":"ack","id":"1","ok":true}
 * 推送：{"event":"room:update","room":...,"game":...}
 */
package com.a3.game.websocket;
