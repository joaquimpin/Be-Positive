function mensajeError(window, document, $, type, message) {

  'use strict';

  window.FlashMessage.addCustomVerbs('forbidden', 'disabled');


  switch (type) {
    case "success":
      window.FlashMessage.success(message, {
        timeout: 8000,
        interactive: false,
        progress: true,
        theme: 'dark'
      });
      break;
    case "warning":

      window.FlashMessage.warning(message, {
        timeout: 5000,
        progress: true,
        onClick: () => alert(message)
      });
      break;
    case "error":

      window.FlashMessage.error(message, {
        timeout: 7000,
        progress: true
      });
      break;
    case "info":
      window.FlashMessage.info(message, {
        timeout: 8000,
        progress: true
      });
      break;

  }





  // Add flash behavior on existing DOM element
  Flash.create('.js-msg');

  // Create a flash bag and attach messages into it
  // var bag = Flash.create({ limit: 2 });
  // bag.attach(
  //   window.FlashMessage.success('Message bag #1'),
  //   window.FlashMessage.info('Message bag #2', { progress: true }),
  //   window.FlashMessage.error('Message bag #3')
  // );




  // OR

  // With a jQuery plugin
  // $('document').ready(function () {

  //   $('.jq-msg').flashjs();

  // });

}
