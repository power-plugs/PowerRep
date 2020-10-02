const { Plugin } = require('powercord/entities');
const { React, getModule, getAllModules } = require('powercord/webpack');
const { forceUpdateElement, getOwnerInstance, waitFor } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { get } = require('powercord/http');
const { TabBar } = require('powercord/components');

const DiscordRep = require('./components/DiscordRep');
const Settings = require('./components/Settings');

module.exports = class PowerRep extends Plugin {
  async startPlugin() {
    if(!this.settings.get("apikey"))
      this.settings.set("apikey", "");

    this.classes = {
     ...await getModule(['headerInfo', 'nameTag']),
     ...await getAllModules(['modal', 'inner'])[1],
     header: (await getModule(['iconBackgroundTierNone', 'container'])).header
    };

    Object.keys(this.classes).forEach(
      key => this.classes[key] = `.${this.classes[key].split(' ')[0]}`
    );

    powercord.api.settings.registerSettings('powerrep', {
      category: this.entityID,
      label: 'DiscordRep',
      render: Settings
    })

    this.loadStylesheet('style.css');
    this._patchUserProfile();
  }

  pluginWillUnload() {
    powercord.api.settings.unregisterSettings("powerrep");
    uninject('discordrep-user-tab-bar');
    uninject('discordrep-user-body');
    uninject('discordrep-user-header');
  }

  async fetchRep(id) {
    return await get(`https://discordrep.com/api/v3/rep/${id}`)
      .set("Authorization", this.settings.get("apikey"))
      .then(r => {this.log(r.body);return r.body});
  }

   async _patchUserProfile() {
    const { classes } = this;
    const instance = getOwnerInstance((await waitFor([
      classes.modal, classes.headerInfo, classes.nameTag
    ].join(' '))).parentElement);
  
    const { tabBarItem } = await getModule(['tabBarItem']);
  
    const UserProfileBody = instance._reactInternalFiber.return.type;
    const _this = this;
  
    inject('discordrep-user-tab-bar', UserProfileBody.prototype, 'renderTabBar', function (_, res) {
      const { user } = this.props;
  
      //Don't bother rendering if there's no tab bar or user
      if (!res || !user) return res;
  
      //Create discord.bio tab bar item
      const repTab = React.createElement(TabBar.Item, {
       key: 'DISCORDREP',
       className: tabBarItem,
       id: 'DISCORDREP'
      }, 'Reputation');
  
      //Add the discord.bio tab bar item to the list
      res.props.children.props.children.push(repTab)
  
      return res;
    });

    inject('discordrep-user-body', UserProfileBody.prototype, 'render', function (_, res) {
      const { children } = res.props;
      const { section, user } = this.props;
      const fetchRep = (id) => _this.fetchRep(id);
      const getSetting = (setting, defaultValue) => _this.settings.get(setting, defaultValue);
  
      if (section !== 'DISCORDREP') return res;
  
      const body = children.props.children[1];
      body.props.children = [];
  
      body.props.children.push(React.createElement(DiscordRep, { id: user.id, fetchRep, getSetting }));
  
      return res;
    });
   }
}