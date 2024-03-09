import ObjectStore from '@pages/storage/db';

export const globalConfigKey_CurrentSessionId = 'currentSessionId';

export const saveGlobalConfig = async (key: string, value: any) => {
  const configStore: ObjectStore<any> = await new ObjectStore<any>('global').open();
  await configStore.saveItemWithKey(value, key);
};

export const getGlobalConfig = async (key: string): Promise<any> => {
  const configStore: ObjectStore<any> = await new ObjectStore<any>('global').open();
  return await configStore.loadItem(key);
};
