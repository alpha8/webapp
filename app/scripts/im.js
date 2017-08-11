var IM = {
  cacheDir: 'im/',
  chat: {
    index: -1
  }
};
    
/********** 这里通过原型链封装了sdk的方法，主要是为了方便快速阅读sdkAPI的使用 *********/
var SDKBridge = function (ctr, data){
  var sdktoken = readCookie('sdktoken'), userUID = readCookie('uid'), that = this;
  //缓存需要获取的用户信息账号
  this.person = {};
  //缓存需要获取的群组账号
  this.team =[];
  this.person[userUID] = true;
  this.cache = data;
  this.controller = ctr;
  window.nim = ctr.nim = this.nim = new SDK.NIM({
    // 初始化SDK
    debug: true || { api: 'info', style: 'font-size:14px;color:blue;background-color:rgba(0,0,0,0.1)' },
    appKey: CONFIG.appkey,
    account: userUID,
    token: sdktoken,
    onconnect: onConnect,
    onerror: onError,
    onwillreconnect: onWillReconnect,
    ondisconnect: onDisconnect,
    // 多端登录
    onloginportschange: onLoginPortsChange,
    // 用户关系
    onblacklist: onBlacklist,
    onsyncmarkinblacklist: onMarkInBlacklist,
    onmutelist: onMutelist,
    onsyncmarkinmutelist: onMarkInMutelist,
    // 好友关系
    onfriends: onFriends,
    onsyncfriendaction: onSyncFriendAction,
    // 用户名片
    onmyinfo: onMyInfo.bind(this),
    onupdatemyinfo: onUpdateMyInfo,
    onusers: onUsers,
    onupdateuser: onUpdateUser,
    // 群组
    onteams: onTeams,
    syncTeamMembers: false,//全成员先不同步了
    onsynccreateteam: onCreateTeam,
    // onteammembers: onTeamMembers,
    // onsyncteammembersdone: onSyncTeamMembersDone,
    // onupdateteammember: onUpdateTeamMember,
    // 会话
    onsessions: onSessions.bind(this),
    onupdatesession: onUpdateSession.bind(this),
    // 消息
    onroamingmsgs: onRoamingMsgs.bind(this).bind(this),
    onofflinemsgs: onOfflineMsgs.bind(this),
    onmsg: onMsg.bind(this),
    // 系统通知
    onofflinesysmsgs: onOfflineSysMsgs.bind(this),
    onsysmsg: onSysMsg.bind(this),
    onupdatesysmsg: onUpdateSysMsg.bind(this),
    onsysmsgunread: onSysMsgUnread.bind(this),
    onupdatesysmsgunread: onUpdateSysMsgUnread.bind(this),
    onofflinecustomsysmsgs: onOfflineCustomSysMsgs.bind(this),
    oncustomsysmsg: onCustomSysMsg,
    // 同步完成
    onsyncdone: onSyncDone
  });

  function onConnect() {
    this.teamMemberDone = false;
    this.sysMsgDone = false;
    console.log('连接成功');
  }
  function onWillReconnect(obj) {
    // 此时说明 `SDK` 已经断开连接, 请开发者在界面上提示用户连接已断开, 而且正在重新建立连接
    console.log('即将重连');
    console.log(obj.retryCount);
    console.log(obj.duration);
  }
  function onKicked(obj) {
    this.iskicked = true;
  }
  function onDisconnect(error) {
    // 此时说明 `SDK` 处于断开状态, 开发者此时应该根据错误码提示相应的错误信息, 并且跳转到登录页面
    console.log('丢失连接');
    console.log(error);
    if (error) {
      switch (error.code) {
      // 账号或者密码错误, 请跳转到登录页面并提示错误
      case 302:
        break;
      // 被踢, 请提示错误后跳转到登录页面
      case 'kicked':
        var map={
          PC:'电脑版',
          Web:'网页版',
          Android:'手机版',
          iOS:'手机版',
          WindowsPhone:'手机版'
         };
         var str =error.from;
         alert('你的帐号于'+dateFormat(+new Date(),'HH:mm')+'被'+(map[str]||'其他端')+'踢出下线，请确定帐号信息安全!');
        break;
      default:
        break;
      }
    }
  }
  function onError(error) {
      console.log(error);
  }

  function onLoginPortsChange(loginPorts) {
      console.log('当前登录帐号在其它端的状态发生改变了', loginPorts);
  }

  function onBlacklist(blacklist) {
      console.log('收到黑名单', blacklist);
      data.blacklist = nim.mergeRelations(data.blacklist, blacklist);
      data.blacklist = nim.cutRelations(data.blacklist, blacklist.invalid);
      refreshBlacklistUI();
  }
  function onMarkInBlacklist(obj) {
      console.log(obj);
      console.log(obj.account + '被你在其它端' + (obj.isAdd ? '加入' : '移除') + '黑名单');
      if (obj.isAdd) {
          addToBlacklist(obj);
      } else {
          removeFromBlacklist(obj);
      }
  }
  function addToBlacklist(obj) {
      data.blacklist = nim.mergeRelations(data.blacklist, obj.record);
      refreshBlacklistUI();
  }
  function removeFromBlacklist(obj) {
      data.blacklist = nim.cutRelations(data.blacklist, obj.record);
      refreshBlacklistUI();
  }
  function refreshBlacklistUI() {
      // 刷新界面
  }
  function onMutelist(mutelist) {
      console.log('收到静音列表', mutelist);
      data.mutelist = nim.mergeRelations(data.mutelist, mutelist);
      data.mutelist = nim.cutRelations(data.mutelist, mutelist.invalid);
      refreshMutelistUI();
  }
  function onMarkInMutelist(obj) {
      console.log(obj);
      console.log(obj.account + '被你' + (obj.isAdd ? '加入' : '移除') + '静音列表');
      if (obj.isAdd) {
          addToMutelist(obj);
      } else {
          removeFromMutelist(obj);
      }
  }
  function addToMutelist(obj) {
      data.mutelist = nim.mergeRelations(data.mutelist, obj.record);
      refreshMutelistUI();
  }
  function removeFromMutelist(obj) {
      data.mutelist = nim.cutRelations(data.mutelist, obj.record);
      refreshMutelistUI();
  }
  function refreshMutelistUI() {
      // 刷新界面
  }

  function onFriends(friends) {
      console.log('收到好友列表', friends);
      data.friends = nim.mergeFriends(data.friends, friends);
      data.friends = nim.cutFriends(data.friends, friends.invalid);
      refreshFriendsUI();
  }
  function onSyncFriendAction(obj) {
      console.log(obj);
      switch (obj.type) {
      case 'addFriend':
          console.log('你在其它端直接加了一个好友' + obj.account + ', 附言' + obj.ps);
          onAddFriend(obj.friend);
          break;
      case 'applyFriend':
          console.log('你在其它端申请加了一个好友' + obj.account + ', 附言' + obj.ps);
          break;
      case 'passFriendApply':
          console.log('你在其它端通过了一个好友申请' + obj.account + ', 附言' + obj.ps);
          onAddFriend(obj.friend);
          break;
      case 'rejectFriendApply':
          console.log('你在其它端拒绝了一个好友申请' + obj.account + ', 附言' + obj.ps);
          break;
      case 'deleteFriend':
          console.log('你在其它端删了一个好友' + obj.account);
          onDeleteFriend(obj.account);
          break;
      case 'updateFriend':
          console.log('你在其它端更新了一个好友', obj.friend);
          onUpdateFriend(obj.friend);
          break;
      }
  }
  function onAddFriend(friend) {
      data.friends = nim.mergeFriends(data.friends, friend);
      refreshFriendsUI();
  }
  function onDeleteFriend(account) {
      data.friends = nim.cutFriendsByAccounts(data.friends, account);
      refreshFriendsUI();
  }
  function onUpdateFriend(friend) {
      data.friends = nim.mergeFriends(data.friends, friend);
      refreshFriendsUI();
  }
  function refreshFriendsUI() {
      // 刷新界面
  }

  function onMyInfo(user) {
      console.log('收到我的名片', user);
      data.myInfo = user;
      updateMyInfoUI();
  }
  function onUpdateMyInfo(user) {
      console.log('我的名片更新了', user);
      data.myInfo = NIM.util.merge(data.myInfo, user);
      updateMyInfoUI();
  }
  function updateMyInfoUI() {
      // 刷新界面
  }
  function onUsers(users) {
      console.log('收到用户名片列表', users);
      data.users = nim.mergeUsers(data.users, users);
  }
  function onUpdateUser(user) {
      console.log('用户名片更新了', user);
      data.users = nim.mergeUsers(data.users, user);
  }

  function onTeams(teams) {
      console.log('群列表', teams);
      data.teams = nim.mergeTeams(data.teams, teams);
      onInvalidTeams(teams.invalid);
  }
  function onInvalidTeams(teams) {
      data.teams = nim.cutTeams(data.teams, teams);
      data.invalidTeams = nim.mergeTeams(data.invalidTeams, teams);
      refreshTeamsUI();
  }
  function onCreateTeam(team) {
      console.log('你创建了一个群', team);
      data.teams = nim.mergeTeams(data.teams, team);
      refreshTeamsUI();
      onTeamMembers({
          teamId: team.teamId,
          members: owner
      });
  }
  function refreshTeamsUI() {
      // 刷新界面
  }
  function onTeamMembers(teamId, members) {
      console.log('群id', teamId, '群成员', members);
      data.teamMembers = data.teamMembers || {};
      data.teamMembers[teamId] = nim.mergeTeamMembers(data.teamMembers[teamId], members);
      data.teamMembers[teamId] = nim.cutTeamMembers(data.teamMembers[teamId], members.invalid);
      refreshTeamMembersUI();
  }
  function onSyncTeamMembersDone() {
      console.log('同步群列表完成');
  }
  function onUpdateTeamMember(teamMember) {
      console.log('群成员信息更新了', teamMember);
      onTeamMembers({
          teamId: teamMember.teamId,
          members: teamMember
      });
  }
  function refreshTeamMembersUI() {
      // 刷新界面
  }

  function onSessions(sessions) {
    console.log('收到会话列表', sessions);
    // data.sessions = nim.mergeSessions(data.sessions, sessions);
    // updateSessionsUI();
    var old = this.cache.getSessions();
    this.cache.setSessions(this.nim.mergeSessions(old, sessions));
    for(var i = 0;i<sessions.length;i++){
      if(sessions[i].scene==='p2p'){
        this.person[sessions[i].to] = true;
      }else{
        this.team.push(sessions[i].to);
        var arr = getAllAccount(sessions[i].lastMsg);
        if(!arr){
          continue;
        }
        for(var j = arr.length -1; j >= 0; j--){
          this.person[arr[j]] = true;
        }
      }
    }
  }
  function onUpdateSession(session) {
    console.log('会话更新了', session);
    // data.sessions = nim.mergeSessions(data.sessions, session);
    // updateSessionsUI();
    var id = session.id||'';
    var old = this.cache.getSessions();
    this.cache.setSessions(this.nim.mergeSessions(old, session));

    //已读回执处理
    this.controller.markMsgRead(id);
  }
  function updateSessionsUI() {
      // 刷新界面
  }

  function onRoamingMsgs(obj) {
      console.log('漫游消息', obj);
      pushMsg(obj.msgs);
  }
  function onOfflineMsgs(obj) {
      console.log('离线消息', obj);
      pushMsg(obj.msgs);
  }
  function onMsg(msg) {
    console.log('收到消息', msg.scene, msg.type, msg);
    // pushMsg(msg);
    this.controller.doMsg(msg);
  }
  function pushMsg(msgs) {
    if (!Array.isArray(msgs)) { msgs = [msgs]; }
    var sessionId = msgs[0].sessionId;
    data.msgs = data.msgs || {};
    data.msgs[sessionId] = nim.mergeMsgs(data.msgs[sessionId], msgs);
  }

  function onOfflineSysMsgs(sysMsgs) {
      console.log('收到离线系统通知', sysMsgs);
      pushSysMsgs(sysMsgs);
  }
  function onSysMsg(sysMsg) {
      console.log('收到系统通知', sysMsg);
      pushSysMsgs(sysMsg);
  }
  function onUpdateSysMsg(sysMsg) {
      pushSysMsgs(sysMsg);
  }
  function pushSysMsgs(sysMsgs) {
    data.sysMsgs = nim.mergeSysMsgs(data.sysMsgs, sysMsgs).sort(function(a,b){
      return b.time-a.time;
    });
    refreshSysMsgsUI();
  }
  function onSysMsgUnread(obj) {
      console.log('收到系统通知未读数', obj);
      data.sysMsgUnread = obj;
      refreshSysMsgsUI();
  }
  function onUpdateSysMsgUnread(obj) {
      console.log('系统通知未读数更新了', obj);
      data.sysMsgUnread = obj;
      refreshSysMsgsUI();
  }
  function refreshSysMsgsUI() {
      // 刷新界面
  }
  function onOfflineCustomSysMsgs(sysMsgs) {
      console.log('收到离线自定义系统通知', sysMsgs);
  }
  function onCustomSysMsg(sysMsg) {
    console.log('收到自定义系统通知', sysMsg);
    //多端同步 正在输入自定义消息类型需要过滤
    var id = JSON.parse(sysMsg.content).id;
    if(id==1){
      return;
    }
  }

  function onSyncDone() {
    console.log('同步完成');
  }
};

/**
 * 设置当前会话，当前会话未读数会被置为0，同时开发者会收到 onupdatesession回调
 * @param {String} scene 
 * @param {String} to    
*/
SDKBridge.prototype.setCurrSession = function(scene,to){
  this.nim.setCurrSession(scene+'-'+to);
};

/**
* 发送普通文本消息
* @param scene：场景，分为：P2P点对点对话，team群对话
* @param to：消息的接收方
* @param text：发送的消息文本
* @param callback：回调
*/
SDKBridge.prototype.sendTextMessage = function (scene, to, text , callback) {
  this.nim.sendText({
    scene: scene || 'p2p',
    to: to,
    text: text,
    done: callback
  });
};
/**
* 发送自定义消息
* @param scene：场景，分为：P2P点对点对话，team群对话
* @param to：消息的接收方
* @param content：消息内容对象
* @param callback：回调
*/
SDKBridge.prototype.sendCustomMessage = function (scene, to, content , callback) {
  this.nim.sendCustomMsg({
    scene: scene || 'p2p',
    to: to,
    content: JSON.stringify(content),
    done: callback
  });
};

/**
* 发送文件消息
* @param scene：场景，分为：P2P点对点对话，team群对话,callback回调
* @param to：消息的接收方
* @param text：发送的消息文本
* @param callback：回调
*/
SDKBridge.prototype.sendFileMessage = function (scene, to, fileInput , callback) {
  var that = this,
  value = fileInput.value,
  ext = value.substring(value.lastIndexOf('.') + 1, value.length),
  type = /png|jpg|bmp|jpeg|gif/i.test(ext) ? 'image' : 'file';
  this.nim.sendFile({
    scene: scene,
    to: to,
    type: type,
    fileInput: fileInput,
    uploadprogress: function (data) {
     console.log(data.percentageText);
    },
    uploaderror: function () {
      console.log('上传失败');
    },
    uploaddone: function(error, file) {
     console.log(error);
     console.log(file);
     console.log('上传' + (!error?'成功':'失败'));
    },
    beforesend: function (msgId) {
      console.log('正在发送消息, id=' + msgId);
    },
    done: callback
  });
};

/**
 * 获取云记录消息
 * @param  {Object} param 数据对象
 * @return {void}       
 */
SDKBridge.prototype.getHistoryMsgs = function(param){
  nim.getHistoryMsgs(param);
};

/**
 * 获取本地历史记录消息  
 */
SDKBridge.prototype.getLocalMsgs = function(sessionId,end,done){
  if(end){
    this.nim.getLocalMsgs ({
     sessionId:sessionId,
     end:end,
     limit:20,
     done:done
   });
  }else{
    this.nim.getLocalMsgs ({
     sessionId:sessionId,
     limit:20,
     done:done
   });
  }
};

SDKBridge.prototype.getLocalTeams = function(teamIds,done){
  this.nim.getLocalTeams ({
    teamIds:teamIds,
    done:done
  });
};
/**
 * 获取本地系统消息记录
 * @param  {Funciton} done 回调
 * @return {void}       
 */
 SDKBridge.prototype.getLocalSysMsgs = function(done){
   this.nim.getLocalSysMsgs({
    done:done
  });
 };

/**
 * 获取删除本地系统消息记录
 * @param  {Funciton} done 回调
 * @return {void}       
 */
 SDKBridge.prototype.deleteAllLocalSysMsgs = function(done){
   this.nim.deleteAllLocalSysMsgs({
    done: done
  });
 };

/**
 * 通过入群申请
 */
SDKBridge.prototype.passTeamApply = function(teamId,from,idServer){
  this.nim.passTeamApply({
    teamId:teamId,
    from:from,
    idServer:idServer,
    done:function(err,data){}
  });
};

/**
 * 拒绝入群申请
 */
SDKBridge.prototype.rejectTeamApply = function(teamId,from,idServer){
  this.nim.rejectTeamApply({
    teamId:teamId,
    from:from,
    idServer:idServer,
    done:function(err,data){

    }
  });
};

/**
 * 拒绝入群邀请
 */
SDKBridge.prototype.rejectTeamInvite = function(teamId,from,idServer){
  this.nim.rejectTeamInvite({
    teamId:teamId,
    from:from,
    idServer:idServer,
    done:function(err,data){}
  });
};

/**
 * 接受入群邀请
 */
SDKBridge.prototype.acceptTeamInvite = function(teamId,from,idServer){
  this.nim.acceptTeamInvite({
    teamId:teamId,
    from:from,
    idServer:idServer,
    done:function(err,data){

    }
  });
 };
/**
 * 踢人
 * @param  {int} type  设备端
 * @return {void}     
 */
SDKBridge.prototype.kick = function(type){
  var deviceIds = (type ===0?this.mobileDeviceId:this.pcDeviceId);
  this.nim.kick({
     deviceIds: [deviceIds],
     done: function(error, obj){
      alert('踢'+(type===0?'移动':'PC')+'端' + (!error?'成功':'失败'));
      console.log(error);
      console.log(obj);
    }
  });
 };
// 获取群信息
SDKBridge.prototype.getTeam = function(account,done){
  this.nim.getTeam({
    teamId: account,
    done: done
  });
};
//申请加入高级群
SDKBridge.prototype.applyTeam = function(account){
  this.nim.applyTeam({
    teamId: account,
    done: function(err,data){
      if(err){
        alert(err.message);
      }else{
        alert('入群申请已发出');
      }
    }
  });
};

SDKBridge.prototype.createTeam = function(param){
  this.nim.createTeam(param);
};

SDKBridge.prototype.getTeamMembers = function(id, callback){
  this.nim.getTeamMembers({
   teamId: id,
   done:callback
 });
};
SDKBridge.prototype.updateTeam = function(param){
  this.nim.updateTeam(param);
};
SDKBridge.prototype.leaveTeam = function(param){
  this.nim.leaveTeam(param);
};
SDKBridge.prototype.dismissTeam = function(param){
  this.nim.dismissTeam(param);
};
SDKBridge.prototype.addTeamMembers= function(param){
  this.nim.addTeamMembers(param);
};
SDKBridge.prototype.removeTeamMembers = function(param){
  this.nim.removeTeamMembers(param);
};

/**
 * 群成员静音
 */
SDKBridge.prototype.updateMuteStateInTeam = function(id,account,mute,callback){
   this.nim.updateMuteStateInTeam({
     teamId:id,
     account: account,
     mute: mute,
     done: callback
   });
};
/**
 * 加好友（不需要验证）
 * @param  {String}   uid       
 * @param  {Function} callback 
 * @return             
 */
SDKBridge.prototype.addFriend = function(account,callback){
  this.nim.addFriend({
    account: account,
    done: callback
  });
};
/**
 * 删好友
 * @param  {[type]}   account  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
SDKBridge.prototype.deleteFriend = function(account,callback){
  this.nim.deleteFriend({
    account: account,
    done: callback
  });
 };

/**
 * 静音
 */
SDKBridge.prototype.markInMutelist = function(account,isAdd,callback){
  this.nim.markInMutelist({
     account: account,
     isAdd:isAdd,
     done: callback
  });
};

/**
 * 黑名单
 */
SDKBridge.prototype.markInBlacklist = function(account,isAdd,callback){
  this.nim.markInBlacklist({
    account: account,
    // true表示加入黑名单，false表示从黑名单移除
    isAdd: isAdd,
    done: callback
  });
};

/**
 * 获取用户信息（如果用户信息让SDK托管）上层限制每次拉取150条
 */
SDKBridge.prototype.getUsers = function(accounts, callback){
  var arr1 = accounts.slice(0,150);
  var arr2 = accounts.slice(150);
  var datas = [];
  var that = this;
  var getInfo = function () {
    that.nim.getUsers({
      accounts: arr1,
      done: function(err,data){
        if (err) {
          callback(err);
        } else {
          datas = datas.concat(data);
          if(arr2.length > 0){
            arr1 = arr2.slice(0, 150);
            arr2 = arr2.slice(150);
            getInfo();
          }else{
            callback(err,datas);
          }
        }
      }     
    });
  };
  getInfo();
};
SDKBridge.prototype.getUser = function(account,callback){
  this.nim.getUser({
    account: account,
    done: callback
  });
};
SDKBridge.prototype.updateMyInfo = function(nick,gender,birth,tel,email,sign,callback){
  this.nim.updateMyInfo({
    nick:nick,
    gender:gender,
    birth:birth,
    tel:tel,
    email:email,
    sign:sign,
    done: callback
  });
};
SDKBridge.prototype.updateMyAvatar = function(avatar,callback){
  this.nim.updateMyInfo({
    avatar:avatar,
    done: callback
  });
};
SDKBridge.prototype.updateFriend = function(account,alias,callback){
  this.nim.updateFriend({
   account: account,
   alias: alias,
   done: callback
 });
};
// SDKBridge.prototype.thumbnailImage = function (options) {
//  return this.nim.thumbnailImage({
//    url:options.url,
//    mode:options.mode,
//    width:options.width,
//    height:options.height
//  })
// }

// SDKBridge.prototype.cropImage = function(option){
//  return this.nim.cropImage(option);
// }

SDKBridge.prototype.previewImage = function(option){
  this.nim.previewFile({
   type: 'image',
   fileInput: option.fileInput,
   uploadprogress: function(obj) {
     console.log('文件总大小: ' + obj.total + 'bytes');
     console.log('已经上传的大小: ' + obj.loaded + 'bytes');
     console.log('上传进度: ' + obj.percentage);
     console.log('上传进度文本: ' + obj.percentageText);
   },
   done: option.callback
 });
};
/**
 * 已读回执
 */
SDKBridge.prototype.sendMsgReceipt = function(msg,done){
  this.nim.sendMsgReceipt({
     msg:msg,
     done: done
  });
};
/**
 * 消息重发
 */
SDKBridge.prototype.resendMsg = function(msg, done){
   this.nim.resendMsg({
     msg:msg,
     done: done
   });
};

var YX = function () {
  this.initModule();
  this.cache = new Cache();
  this.mysdk = new SDKBridge(this, this.cache);
  this.firstLoadSysMsg = true;
  this.totalUnread = 0;
};
YX.fn = YX.prototype;

YX.prototype.initModule = function () {
  this.initBase();  
};

YX.prototype.initBase = function () {
  this.$messageText = $('#messageText');
  this.$chatContent = $('#chatContent');
  this.$sendBtn = $('.im-send-btn');
  this.$audioBtn = $('.im-tool-audio');
  this.$videoBtn = $('.im-tool-video');
  this.$imageBtn = $('.im-tool-image');
  this.$imageInput = $('#uploadImage');
  this.$fileBtn = $('.im-tool-file');
  this.$fileInput = $('#uploadFile');
  this.$faceBtn = $('.im-tool-face');
  this.$hotkeyBtn = $('.im-send-set');
  this.$choseHotkey = $('.im-menu-box li');
  this.$closeBtn = $('.im-send-close');

  this.$messageText.on('keydown', this.inputMessage.bind(this));
  this.$sendBtn.on('click', this.sendTextMessage.bind(this));
  //消息重发
  this.$chatContent.delegate('.j-resend','click',this.doResend.bind(this));
  //语音播发
  this.$chatContent.delegate('.j-mbox','click',this.playAudio);
  this.$audioBtn.on('click', this.inputAudio.bind(this));
  this.$videoBtn.on('click', this.inputVideo.bind(this));
  this.$faceBtn.on('click', this.inputFace.bind(this));
  this.$hotkeyBtn.on('click', this.choseSendSet.bind(this));
  this.$choseHotkey.on('click', this.switchHotKey.bind(this));
  this.$closeBtn.on('click', this.closeWin.bind(this));

  this.$imageInput.on('change', this.uploadImage.bind(this));
  this.$fileInput.on('change', this.uploadFile.bind(this));

  this.$cloudMsg = $('.im-tool-log');
  this.$cloudMsgContainer = $('.cloudMsgContainer');
  this.$cloudMsg.on('click', this.showCloudMsg.bind(this, this.$cloudMsg));
  this.$cloudMsgContainer.delegate('.j-loadMore', 'click', this.loadMoreCloudMsg.bind(this));
  this.$cloudMsgContainer.delegate('.j-mbox','click',this.playAudio);

  //聊天面板右键菜单
  $.contextMenu({
    selector: '.item-me .j-msg', 
    callback: function(key, options) {
      if (key === 'delete') {
        var id = options.$trigger.parent().data('id');
        var msg = this.cache.findMsg(this.crtSession, id);
        if(!msg||options.$trigger.hasClass('j-msg')){}
        options.$trigger.removeClass('j-msg');
        window.nim.deleteMsg({
            msg: msg,
            done: function (err) {
                options.$trigger.addClass('j-msg');
                if(err){
                    if(err.code === 508){
                        layer.msg('发送时间超过2分钟的消息，不能被撤回');
                    }else{
                        layer.msg(err.message||'操作失败');
                    }
                }else{
                    this.backoutMsg(id);
                }
            }.bind(this)
        });
      }
    }.bind(this),
    items: { 'delete': {name: '撤回', icon: 'delete'}  }
  });
};

/** 上传图片 */
YX.prototype.uploadImage = function () {
  var that = this,
      scene = this.crtSessionType,
      to = this.crtSessionAccount,
      fileInput = this.$imageInput.get(0);
  if(fileInput.files.length === 0){
    layer.msg('不能传空文件');
    return;
  }
  this.mysdk.sendFileMessage(scene, to, fileInput,this.sendMsgDone.bind(this));
};
/** 上传文件 */
YX.prototype.uploadFile = function () {
  var that = this,
      scene = this.crtSessionType,
      to = this.crtSessionAccount,
      fileInput = this.$fileInput.get(0);
  if(fileInput.files.length === 0){
    layer.msg('不能传空文件');
    return;
  }
  this.mysdk.sendFileMessage(scene, to, fileInput,this.sendMsgDone.bind(this));
};

/**
 * 查看云记录
 */
YX.prototype.showCloudMsg = function () {
  var that = this;
  if(!that.$cloudMsgContainer.hasClass('hide')){
    that.$cloudMsgContainer.addClass('hide');
    that.$chatContent.show();
    return;
  }
  this.$cloudMsgContainer.load('../im/cloudMsg.html', function() {
    that.$chatContent.hide();
    that.$cloudMsgContainer.removeClass('hide');
    var id = that.crtSessionAccount,
        scene = that.crtSessionType,
        param ={
          scene:scene,
          to:id,
          lastMsgId:0,
          limit:20,
          reverse:false,
          done:that.cbCloudMsg.bind(that)
        };
    that.mysdk.getHistoryMsgs(param);
  });
};
YX.prototype.closeCloudMsgContainer = function () {
  this.$cloudMsgContainer.addClass('hide');
  this.$chatContent.show();
};
/**
 * 加载更多云记录
 */
YX.prototype.loadMoreCloudMsg = function () {
  var id = this.crtSessionAccount,
      scene = this.crtSessionType,
      lastItem = $('#cloudMsgList .item').first(),
      param ={
        scene:scene,
        to:id,
        beginTime:0,
        endTime:parseInt(lastItem.attr('data-time')),
        lastMsgId:parseInt(lastItem.attr('data-idServer')),//idServer 服务器用于区分消息用的ID，主要用于获取历史消息
        limit:20,
        reverse:false,
        done:this.cbCloudMsg.bind(this)
      };
  this.mysdk.getHistoryMsgs(param);
};

/**
 * 云记录获取回调
 * @param  {boolean} error 
 * @param  {object} obj 云记录对象
 */
YX.prototype.cbCloudMsg = function (error,obj) {
  var $node = $('#cloudMsgList'),
      $tip = $('.cloudMsgContainer .u-status span');
  if (!error) {
    if (obj.msgs.length === 0) {
      $tip.html('没有更早的聊天记录');          
    } else {
      if(obj.msgs.length<20){
        $tip.html('没有更早的聊天记录'); 
      }else{
        $tip.html('<a class="j-loadMore">加载更多记录</a>');
      }
      var msgHtml = appUI.buildCloudMsgUI(obj.msgs,this.cache);       
      $(msgHtml).prependTo($node);
    }
  } else {
    layer.msg('获取历史消息失败');
    $tip.html('获取历史消息失败'); 
  }
};

//弹出输入在线音乐地址
YX.prototype.inputAudio = function(){
  var that = this;

  layer.prompt({
    shade: 0, 
    title: '请输入网络音乐地址',
    formType: 0, //输入框类型，支持0（文本）默认1（密码）2（多行文本）
    value: '' //初始时的值，默认空字符
    // maxlength: 140, //可输入文本的最大长度，默认500
  }, function(value, index, elem){
    var scene = that.crtSessionType,
      to = that.crtSessionAccount,
      text = value.trim();
    if ( !!to && !!text) {
      if (text.length > 500) {
        layer.msg('消息长度最大为500字符');
      }else if(text.length===0){
        return;
      } else {
        that.mysdk.sendTextMessage(scene, to, text, that.sendMsgDone.bind(that));
      }
    }
    layer.close(index);
  });
};
//弹出输入在线视频地址
YX.prototype.inputVideo = function(){
  layer.prompt({
    shade: 0, 
    title: '请输入网络视频地址',
    formType: 0, 
    value: ''
  }, function(value, index, elem){
    
    layer.close(index);
  });
};

//选择表情
var facewords = {'[大笑]':{file:'emoji_0.png'},'[可爱]':{file:'emoji_01.png'},'[色]':{file:'emoji_02.png'},'[嘘]':{file:'emoji_03.png'},'[亲]':{file:'emoji_04.png'},'[呆]':{file:'emoji_05.png'},'[口水]':{file:'emoji_06.png'},'[汗]':{file:'emoji_145.png'},'[呲牙]':{file:'emoji_07.png'},'[鬼脸]':{file:'emoji_08.png'},'[害羞]':{file:'emoji_09.png'},'[偷笑]':{file:'emoji_10.png'},'[调皮]':{file:'emoji_11.png'},'[可怜]':{file:'emoji_12.png'},'[敲]':{file:'emoji_13.png'},'[惊讶]':{file:'emoji_14.png'},'[流感]':{file:'emoji_15.png'},'[委屈]':{file:'emoji_16.png'},'[流泪]':{file:'emoji_17.png'},'[嚎哭]':{file:'emoji_18.png'},'[惊恐]':{file:'emoji_19.png'},'[怒]':{file:'emoji_20.png'},'[酷]':{file:'emoji_21.png'},'[不说]':{file:'emoji_22.png'},'[鄙视]':{file:'emoji_23.png'},'[阿弥陀佛]':{file:'emoji_24.png'},'[奸笑]':{file:'emoji_25.png'},'[睡着]':{file:'emoji_26.png'},'[口罩]':{file:'emoji_27.png'},'[努力]':{file:'emoji_28.png'},'[抠鼻孔]':{file:'emoji_29.png'},'[疑问]':{file:'emoji_30.png'},'[怒骂]':{file:'emoji_31.png'},'[晕]':{file:'emoji_32.png'},'[呕吐]':{file:'emoji_33.png'},'[拜一拜]':{file:'emoji_160.png'},'[惊喜]':{file:'emoji_161.png'},'[流汗]':{file:'emoji_162.png'},'[卖萌]':{file:'emoji_163.png'},'[默契眨眼]':{file:'emoji_164.png'},'[烧香拜佛]':{file:'emoji_165.png'},'[晚安]':{file:'emoji_166.png'},'[强]':{file:'emoji_34.png'},'[弱]':{file:'emoji_35.png'},'[OK]':{file:'emoji_36.png'},'[拳头]':{file:'emoji_37.png'},'[胜利]':{file:'emoji_38.png'},'[鼓掌]':{file:'emoji_39.png'},'[握手]':{file:'emoji_200.png'},'[发怒]':{file:'emoji_40.png'},'[骷髅]':{file:'emoji_41.png'},'[便便]':{file:'emoji_42.png'},'[火]':{file:'emoji_43.png'},'[溜]':{file:'emoji_44.png'},'[爱心]':{file:'emoji_45.png'},'[心碎]':{file:'emoji_46.png'},'[钟情]':{file:'emoji_47.png'},'[唇]':{file:'emoji_48.png'},'[戒指]':{file:'emoji_49.png'},'[钻石]':{file:'emoji_50.png'},'[太阳]':{file:'emoji_51.png'},'[有时晴]':{file:'emoji_52.png'},'[多云]':{file:'emoji_53.png'},'[雷]':{file:'emoji_54.png'},'[雨]':{file:'emoji_55.png'},'[雪花]':{file:'emoji_56.png'},'[爱人]':{file:'emoji_57.png'},'[帽子]':{file:'emoji_58.png'},'[皇冠]':{file:'emoji_59.png'},'[篮球]':{file:'emoji_60.png'},'[足球]':{file:'emoji_61.png'},'[垒球]':{file:'emoji_62.png'},'[网球]':{file:'emoji_63.png'},'[台球]':{file:'emoji_64.png'},'[咖啡]':{file:'emoji_65.png'},'[啤酒]':{file:'emoji_66.png'},'[干杯]':{file:'emoji_67.png'},'[柠檬汁]':{file:'emoji_68.png'},'[餐具]':{file:'emoji_69.png'},'[汉堡]':{file:'emoji_70.png'},'[鸡腿]':{file:'emoji_71.png'},'[面条]':{file:'emoji_72.png'},'[冰淇淋]':{file:'emoji_73.png'},'[沙冰]':{file:'emoji_74.png'},'[生日蛋糕]':{file:'emoji_75.png'},'[蛋糕]':{file:'emoji_76.png'},'[糖果]':{file:'emoji_77.png'},'[葡萄]':{file:'emoji_78.png'},'[西瓜]':{file:'emoji_79.png'},'[光碟]':{file:'emoji_80.png'},'[手机]':{file:'emoji_81.png'},'[电话]':{file:'emoji_82.png'},'[电视]':{file:'emoji_83.png'},'[声音开启]':{file:'emoji_84.png'},'[声音关闭]':{file:'emoji_85.png'},'[铃铛]':{file:'emoji_86.png'},'[锁头]':{file:'emoji_87.png'},'[放大镜]':{file:'emoji_88.png'},'[灯泡]':{file:'emoji_89.png'},'[锤头]':{file:'emoji_90.png'},'[烟]':{file:'emoji_91.png'},'[炸弹]':{file:'emoji_92.png'},'[枪]':{file:'emoji_93.png'},'[刀]':{file:'emoji_94.png'},'[药]':{file:'emoji_95.png'},'[打针]':{file:'emoji_96.png'},'[钱袋]':{file:'emoji_97.png'},'[钞票]':{file:'emoji_98.png'},'[银行卡]':{file:'emoji_99.png'},'[手柄]':{file:'emoji_100.png'},'[麻将]':{file:'emoji_101.png'},'[调色板]':{file:'emoji_102.png'},'[电影]':{file:'emoji_103.png'},'[麦克风]':{file:'emoji_104.png'},'[耳机]':{file:'emoji_105.png'},'[音乐]':{file:'emoji_106.png'},'[吉他]':{file:'emoji_107.png'},'[火箭]':{file:'emoji_108.png'},'[飞机]':{file:'emoji_109.png'},'[火车]':{file:'emoji_110.png'},'[公交]':{file:'emoji_111.png'},'[轿车]':{file:'emoji_112.png'},'[出租车]':{file:'emoji_113.png'},'[警车]':{file:'emoji_114.png'},'[自行车]':{file:'emoji_115.png'}};

YX.prototype.inputFace = function(){
  var html = '<ul class="layui-clear layim-face-list">';
  for(var key in facewords){
    var gif = IM.cacheDir + 'images/emoji/' + facewords[key].file;
    html += '<li title="'+key+'"><img src="'+gif+'"></li>';
  }
  html += '</ul>';

  layer.tips(html, '.im-tool-face', {
    tips: [1, '#fff'], 
    skin: 'ui-im-face', 
    time: 0,
    area: ['394px','208px'],
    success:function(layero, index){
      layero.find('.layim-face-list>li').on('touchstart click', function(e){
        e.preventDefault();

        var txtChat = $('#messageText');
        var text = txtChat.val(); 
        txtChat.val(text + this.title+' ');
        layer.close(index);
      });
    }
  });
};
/**
* 通过正则替换掉文本消息中的emoji表情
* @param text：文本消息内容
*/
function buildEmoji(text) {
  var re = /\[([^\]\[]*)\]/g;
  var matches = text.match(re) || [];
  for (var j = 0, len = matches.length; j < len; ++j) {
    if(facewords[matches[j]]){
      text = text.replace(matches[j], '<img class="emoji" src="'+IM.cacheDir + 'images/emoji/' + facewords[matches[j]].file + '" />');
    }   
  }
  return text;
}
//选择热键
YX.prototype.switchHotKey = function(e){
  e = e ||window.event;
  var target = e.target || e.srcElement;
  $(target).toggleClass('im-this').siblings().removeClass('im-this').parent().hide();
};
//发送消息热键选择
YX.prototype.choseSendSet = function(){
  this.$hotkeyBtn.siblings('.im-menu-box').toggle();
};
//关闭IM聊天窗口
YX.prototype.closeWin = function(){
  if(IM.chat.index != -1){
    layer.close(IM.chat.index);
    IM.chat.index = -1;
  }
};
/**
* 发送消息完毕后的回调
* @param error：消息发送失败的原因
* @param msg：消息主体，类型分为文本、文件、图片、地理位置、语音、视频、自定义消息，通知等
*/
YX.prototype.sendMsgDone = function (error, msg) {
  this.cache.addMsgs(msg);
  this.$messageText.val('');

  this.$chatContent.find('.no-msg').remove();
  var msgHtml = appUI.updateChatContentUI(msg,this.cache);
  this.$chatContent.append(msgHtml).scrollTop(99999);
  // console.log('发送' + msg.scene + ' ' + msg.type + '消息' + (!error?'成功':'失败') + ', id=' + msg.idClient);
};
YX.prototype.sendTextMessage = function () {
  var scene = this.crtSessionType,
      to = this.crtSessionAccount,
      text = this.$messageText.val().trim();
  if ( !! to && !! text) {
    if (text.length > 500) {
      layer.msg('消息长度最大为500字符');
    }else if(text.length===0){
      return;
    } else {
      this.mysdk.sendTextMessage(scene, to, text, this.sendMsgDone.bind(this));
    }
  }
};
YX.prototype.inputMessage = function (e) {
  var ev = e || window.event;
  var key = ev.keyCode || ev.which;
  var hotKey = $('.im-menu-box .im-this').attr('im-type');

  if('Ctrl+Enter' == hotKey){
    if(ev.ctrlKey && 13 === key){
      //ctrl+enter发送消息
      this.sendTextMessage();
      ev.preventDefault();
    }
  }else{
    if(key === 13 && ev.ctrlKey){
      this.$messageText.val(this.$messageText.val() + '\r\n');
    }

    if(key === 13){
      //enter发送消息
      this.sendTextMessage();
      ev.preventDefault();
    }
  }
};
// 重发
YX.prototype.doResend = function (evt) {
  var $node;
  if(evt.target.tagName.toLowerCase() === 'span'){
    $node = $(evt.target);
  } else {
    $node = $(evt.target.parentNode);
  }
  var sessionId = $node.data('session');
  var idClient = $node.data('id');
  var msg = this.cache.findMsg(sessionId, idClient);
  this.mysdk.resendMsg(msg, function(err,data){
    if(err){
      alert(err.message||'发送失败');
    }else{
      this.cache.setMsg(sessionId,idClient,data);
      var msgHtml = appUI.buildChatContentUI(sessionId,this.cache);
      this.$chatContent.html(msgHtml).scrollTop(99999);
    }
  }.bind(this));
};
/**
 * 语音播放
 */
YX.prototype.playAudio = function(){
  if(!!window.Audio){
    var node = $(this),
        btn = $(this).children('.j-play');
    node.addClass('play');
    setTimeout(function(){node.removeClass('play');},parseInt(btn.attr('data-dur')));
    new window.Audio(btn.attr('data-src')+'?audioTrans&type=mp3').play();
  }
};
YX.prototype.openChatBox = function(account, scene){
  this.mysdk.setCurrSession(scene,account);
  this.crtSession = scene+'-'+account;
  this.crtSessionType = scene;
  this.crtSessionAccount = account;

  this.$messageText.val('');
};

/************************************************************
 * 获取当前会话消息
 * @return {void}
 *************************************************************/
YX.prototype.getHistoryMsgs = function (scene,account) {
  // var id = scene + "-" + account;
  // this.mysdk.getLocalMsgs(id, false, this.getLocalMsgsDone.bind(this));
  var id = scene + '-' + account;
  var sessions = this.cache.findSession(id);
  var msgs = this.cache.getMsgs(id);
  //标记已读回执
  this.sendMsgRead(account, scene);
  if(!!sessions){
    if(sessions.unread>=msgs.length){
      var end = (msgs.length>0)?msgs[0].time:false;
      this.mysdk.getLocalMsgs(id,end,this.getLocalMsgsDone.bind(this));
      return;
    }
  }
  this.doChatUI(id);
};

//拿到历史消息后聊天面板UI呈现
YX.prototype.doChatUI = function (id) {
  var temp = appUI.buildChatContentUI(id,this.cache);
  this.$chatContent.html(temp);
  this.$chatContent.scrollTop(9999);
   //已读回执UI处理
  this.markMsgRead(id);
};
YX.prototype.getLocalMsgsDone = function(error,data){
  console.log('获取本地消息' + (!error?'成功':'失败'), data);

  if(!error){
    this.cache.addMsgsByReverse(data.msgs);
    var id = data.sessionId;
    var array = getAllAccount(data.msgs);
    var that = this;
    this.checkUserInfo(array, function() {
       that.doChatUI(id);
    });
  }else{
    layer.msg('获取历史消息失败');
  }
};
//检查用户信息有木有本地缓存 没的话就去拿拿好后在执行回调
YX.prototype.checkUserInfo = function (array,callback) {
  var arr = [];
  var that = this;
  for (var i = array.length - 1; i >= 0; i--) {
    if(!this.cache.getUserById(array[i])){
      arr.push(array[i]);
    }
  }
  if(arr.length>0){
    this.mysdk.getUsers(arr,function(error,data){
      if(!error){
        that.cache.setPersonlist(data);
        callback();
      }else{
        layer.msg('获取用户信息失败');
      }   
    });
  }else{
    callback();
  }
};
//发送已读回执
YX.prototype.sendMsgRead = function(account, scene){
  if(scene==='p2p'){
    var id = scene+'-'+account;
    var sessions = this.cache.findSession(id);
    this.mysdk.sendMsgReceipt(sessions.lastMsg,function(err,data){
      if(err){
        console.log(err);
      }
    });
  }
};
//UI上标记消息已读
YX.prototype.markMsgRead = function(id){
  if(!id||this.crtSession!==id){
    return;
  }
  var msgs = this.cache.getMsgs(id);
  for (var i = msgs.length-1;i>=0; i--) {
    var message = msgs[i];
    // 目前不支持群已读回执
    if(message.scene==='team'){
      return;
    }
    if(window.nim.isMsgRemoteRead(message)){
      $('.item.item-me.read').removeClass('read');
      $('#'+message.idClient).addClass('read');
      break;
    }
  }
};
//撤回消息
YX.prototype.backoutMsg = function(id, data){
  var msg = data? data.msg : this.cache.findMsg(this.crtSession, id);
  var to  = msg.target;
  var session = msg.sessionId;
  window.nim.sendTipMsg({
    isLocal: true,
    scene: msg.scene,
    to: to,
    tip: (userUID === msg.from ? '你' : getNick(msg.from)) + '撤回了一条消息',
    time: msg.time,
    done: function (err, data) {
      if(!err){
        this.cache.backoutMsg(session, id, data);
        if(this.crtSession === session){
          var msgHtml = appUI.buildChatContentUI(this.crtSession, this.cache);
          this.$chatContent.html(msgHtml).scrollTop(99999);
        }
      }else{
          layer.msg('消息撤回失败');
      }
    }.bind(this)
  });   
};
/**
 * 处理收到的消息 
 * @param  {Object} msg 
 * @return 
 */
YX.prototype.doMsg = function(msg){
  var that = this,
    who = msg.to === userUID ? msg.from : msg.to,
    updateContentUI = function(){
      //如果当前消息对象的会话面板打开
      if (that.crtSessionAccount === who) { 
        that.sendMsgRead(who,msg.scene);
        var msgHtml = appUI.updateChatContentUI(msg,that.cache);
        that.$chatContent.find('.no-msg').remove();
        that.$chatContent.append(msgHtml).scrollTop(99999);
      }    
    };

  //非群通知消息处理
  if (/text|image|file|audio|video|geo|custom|tip/i.test(msg.type)) {
    this.cache.addMsgs(msg);
    var account = (msg.scene==='p2p'?who:msg.from);
    //用户信息本地没有缓存，需存储
    if(!this.cache.getUserById(account)){
      this.mysdk.getUser(account,function(err,data){
        if(!err){
          that.cache.updatePersonlist(data);
          updateContentUI();
        }
      });      
    }else{
      updateContentUI();
    } 
  }else{ 
    // 群消息处理
    // this.messageHandler(msg,updateContentUI);
  }
};

var appUI = {
  /**
   * 当前会话聊天面板UI
   */
  buildChatContentUI:function(id, cache){
    var msgHtml = '', msgs = cache.getMsgs(id);
    if(msgs.length===0){
      msgHtml = '<div class="no-msg tc"><span class="radius5px">暂无消息</span></div>';
    }else{
      for (var i = 0, l = msgs.length; i < l; ++i) {
        var message = msgs[i],
          user = cache.getUserById(message.from);
        //消息时间显示
        if(i === 0){
          msgHtml += this.makeTimeTag(transTime(message.time));
        }else{
          if(message.time-msgs[i-1].time>5*60*1000){
            msgHtml += this.makeTimeTag(transTime(message.time));
          }
        }
        msgHtml += this.makeChatContent(message,user);          
      }
    }
    return msgHtml;
  },
  /**
   * 更新当前会话聊天面板UI
   */
  updateChatContentUI:function(msg,cache){
  var lastItem =$('#chatContent .item').last(),
        msgHtml='',
        user = cache.getUserById(msg.from);
      if(lastItem.length===0){
          msgHtml += this.makeTimeTag(transTime(msg.time));
      }else{
          if(msg.time-parseInt(lastItem.attr('data-time'))>5*60*1000){
              msgHtml += this.makeTimeTag(transTime(msg.time));
          }
      }
      msgHtml += this.makeChatContent(msg,user);
      return msgHtml;
  },
  /**
   * 通用消息内容UI
   */
  makeChatContent:function(message,user){
    var msgHtml;
    //通知类消息
    if (message.attach && message.attach.type) {
      var notificationText = transNotification(message);
      msgHtml =  '<p class="u-notice tc item" data-time="'+ message.time +'" data-id="'+ message.idClient +'" data-idServer="'+ message.idServer +'"><span class="radius5px">'+notificationText+'</span></p>';
    }else{  
      //聊天消息
      var type = message.type,
          from = message.from,
          avatar = user.avatar,
          showNick = message.scene === 'team' && from !== userUID;
      if(type==='tip'){
        msgHtml = ['<div data-time="'+ message.time +'" data-id="'+ message.idClient +'" id="'+ message.idClient +'" data-idServer="'+ message.idServer +'">',
                        '<p class="u-notice tc item '+ (from == userUID&&message.idServer ? 'j-msgTip':'') +'" data-time="'+ message.time +'" data-id="'+ message.idClient +'" data-idServer="'+ message.idServer +'"><span class="radius5px">'+getMessage(message)+'</span></p>',
                    '</div>'].join('');
      }else{
        msgHtml = ['<div data-time="'+ message.time +'" data-id="'+ message.idClient +'" id="'+ message.idClient +'" data-idServer="'+ message.idServer +'" class="item item-' + buildSender(message) + '">',
            '<img class="img j-img" src="'+getAvatar(avatar)+'" data-account="' + from + '"/>',
            showNick?'<p class="nick">' + getNick(from) + '</p>':'',
            '<div class="msg msg-text j-msg">',
              '<div class="box">',
                '<div class="cnt">',
                  getMessage(message),
                '</div>',
              '</div>',
            '</div>',
            message.status === 'fail'?'<span class="error j-resend" data-session="'+ message.sessionId +'" data-id="'+ message.idClient +'"><i class="icon icon-error"></i>发送失败,点击重发</span>':'',
                       '<span class="readMsg"><i></i>已读</span>',
          '</div>'].join('');           
      }
    }
    return msgHtml;
  },
  /**
   * 云记录面板UI
   */
  buildCloudMsgUI:function(msg,cache){
    var msgHtml = '',
      len = msg.length,
      meessage;

    for (var i = len - 1; i >= 0; --i) {
      message = msg[i];
      if(i == (len -1)){
        msgHtml += this.makeTimeTag(transTime(message.time));
      }else{
        if(message.time-msg[i+1].time>5*60*1000){
          msgHtml += this.makeTimeTag(transTime(message.time));
        }
      }
      msgHtml += this.makeChatContent(message,cache.getUserById(message.from));
    }
    return msgHtml;
  },

  //聊天消息中的时间显示
  makeTimeTag : function(time){
    return '<p class="u-msgTime">- - - - -&nbsp;'+time+'&nbsp;- -- - -</p>';
  }
};

var Login = {
  requestLogin: function(account, pwd) {
    setCookie('uid',account.toLocaleLowerCase());
    setCookie('sdktoken',pwd);
  }
};
Login.requestLogin('admin', '123456');
var userUID = readCookie('uid');

(function($) {
  $(document).ready(function(){
    var yunXin = new YX();

    layer.open({
      shade: 0,
      title: false,
      type: 1, 
      skin: 'im-min',
      area: '168px',
      scrollbar: false, 
      closeBtn: false,
      offset: 'rb',
      content: '<img src="images/profile_small.jpg" style="cursor: move;"><span>客服小虎</span>',
      success: function(layero, index){
        $(layero).find('.layui-layer-content').css('overflow', 'hidden');
        $(layero).bind('touchstart click', function(e){
          e.preventDefault();

          IM.chat.index = layer.open({
            shade: 0,
            maxmin: true,
            resize: false,
            // title: false,
            title: ['&#8203;'],
            area: '600px',
            // scrollbar: false,
            type: 1, 
            skin: 'ui-im-chat',
            // anim: 2,
            content: $('#ui-im-chat'),
            success: function(layero, index){
              $(layero).find('.layui-layer-content').css('overflow', 'visible');

              yunXin.openChatBox('alpha', 'p2p');
              yunXin.getHistoryMsgs('p2p', 'alpha');
            },
            full: function(layero){
              $(layero).find('.im-chat-main').css('height', $(layero).height() - 80 - 185);
            },
            min: function(leyero){
              if(IM.chat.index != -1){
                layer.close(IM.chat.index);
                IM.chat.index = -1;
              }
            },
            restore:function(layero){
              $(layero).find('.im-chat-main').css('height', '261px');
            }
          });

        });
      }
    });

  });

  //关闭tips提示框
  $(document).off('mousedown',tipsHide).on('mousedown',tipsHide);
  $(window).off('resize',tipsHide).on('resize',tipsHide);
  function tipsHide(){
    layer.closeAll('tips');
  }

})(jQuery);  
