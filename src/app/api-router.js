import apiApp from '../../__create/api-server';

export async function loader({ request }) {
  return apiApp.fetch(request);
}

export async function action({ request }) {
  return apiApp.fetch(request);
}
