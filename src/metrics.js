// Datadog Stats
import { datadogLogs } from '@datadog/browser-logs'

datadogLogs.init({
  clientToken: 'pubde9290f61adcc5883d4b419722a24b39',
  site: 'datadoghq.eu',
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

