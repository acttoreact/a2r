import axios from 'axios';

const getDockerImageVersion = async (image: string): Promise<string> => {
  const url = `https://hub.docker.com/v2/repositories/act2react/${image}/tags/?page_size=1`;
  const res = await axios.get<{ results: { name: string }[] }>(url);
  return res.data.results[0].name;
};

export default getDockerImageVersion;
