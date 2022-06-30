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

function log({ type = 'info', message, ...options }) {
  const attributes = {
    ...options,
    view: {
      url: getPageUrl(),
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
}

export function logPageHelped() {
  log({
    message: "Page helped",
    action: "page.helped"
  })
}

