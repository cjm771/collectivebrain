require('dotenv').config();
const Handlebars = require('handlebars');

const mailgun = require('mailgun-js')({
    apiKey: process.env.MAILGUN_API_KEY, 
    domain: process.env.MAILGUN_DOMAIN
});

module.exports = {
  shouldSendEmails: process.env.SEND_EMAILS === 'true',
  send: (data) => {
    data = Object.assign({
      from: 'Collective Brain <noreply@collectivehomeoffice.com>',
    }, data);    
    return new Promise((res, rej) => {
      mailgun.messages().send(data, (err, body) => {
        if (err) return rej(err);
        res(body);
      });
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