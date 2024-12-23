export const usePersist = () => {
  const save = (key: string, value: string) => {
    console.log(key);
    localStorage.setItem(key, value);
  };

  const get = (key: string) => {
    const result = localStorage.getItem(key);

    if (result) {
      return result;
    }

    return "";
  };

  return {
    save,
    get,
  };
};
