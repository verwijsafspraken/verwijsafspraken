// Datadog Stats
import { datadogLogs } from '@datadog/browser-logs'

datadogLogs.init({
  clientToken: 'pub17f8509ed78f912fb055aeaa4a5d8a39',
  site: 'datadoghq.com',
  service: 'verwijsafspraken',
  sampleRate: 100,
});

function getPageUrl() {
  return document.location.hash.slice(1);
}

let referrer = document.referrer;

function log({ type = 'info', message, ...options }) {
  const attributes = {
    ...options,
    view: {
      url: getPageUrl(),
      referrer,
      ...options.view
    }
  };
  datadogLogs.logger.log(message, attributes, type);
}

export function logPageVisit() {
  log({
    message: `Visit page`,
    action: "page.visit",
  });
  referrer = document.location.href;
}

export function logPageHelped() {
  log({
    message: "Page helped",
    action: "page.helped"
  })
}

