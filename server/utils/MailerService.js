require('dotenv').config();
const Handlebars = require('handlebars');
const sendgrid = require('@sendgrid/mail');
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
  shouldSendEmails: process.env.SEND_EMAILS === 'true',
  send: (data) => {
    data = Object.assign({
      from: 'noreply@collectivehomeoffice.com',
      from: {
        email: 'noreply@collectivehomeoffice.com',
        name: 'collectivebrain'
    },
    }, data);    
    return sendgrid.send(data).then((data) => {
      debugger;
    }).catch((error) => {
      debugger;
      throw error;
    })
  },
  MESSAGES: {
    INVITE: (ctx) => {
      const data = {
        to: ctx.invitee.email,
        subject: Handlebars.compile('{{ user.name }} invites you to the collectivebrain!')(ctx),
        text: Handlebars.compile(`
Hi {{ invitee.name }},

{{ user.name }} invites you to the collectivebrain as role:{{ invitee.roleName }}! Please follow the link below to get started!
{{{ invitee.inviteUrl }}}

All the best,
collectivebrain 
`)(ctx),
      }
      return data;
    }
  }
}