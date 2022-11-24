import {
  Bytes,
  Int,
  List,
  Metadatum,
  String as OgmiosString,
  Map,
} from '@cardano-ogmios/schema';

type ListObject = Array<MetadataObject>;
type NativeValue = string | undefined;
interface JsonObject {
  [key: string]: MetadataObject;
}

type MetadataObject = JsonObject | ListObject | NativeValue;

const getIntValue = (val: Metadatum) => {
  return Object.prototype.hasOwnProperty.call(val, 'int')
    ? (val as Int).int.toString()
    : undefined;
};

const getStringValue = (val: Metadatum) => {
  return Object.prototype.hasOwnProperty.call(val, 'string')
    ? (val as OgmiosString).string
    : undefined;
};

const getByteValue = (val: Metadatum) => {
  return Object.prototype.hasOwnProperty.call(val, 'string')
    ? (val as Bytes).bytes
    : undefined;
};

const getListValue = (val: Metadatum): ListObject | undefined => {
  if (Object.prototype.hasOwnProperty.call(val, 'list')) {
    const list = (val as List).list;
    const res: ListObject = [];
    list.forEach((item) => {
      const val = ObjectToJson(item);
      if (val) {
        res.push(val);
      }
    });
    return res;
  }
  return undefined;
};

const getNativeValue = (val: Metadatum) => {
  const intVal = getIntValue(val);
  if (intVal) return intVal;
  const stringVal = getStringValue(val);
  if (stringVal) return stringVal;
};

const getDictValue = (val: Metadatum) => {
  if (Object.prototype.hasOwnProperty.call(val, 'map')) {
    const list = (val as Map).map;
    const res: JsonObject = {};
    list.forEach((item) => {
      const key = getNativeValue(item.k);
      if (key) {
        res[key] = ObjectToJson(item.v);
      }
    });
    return res;
  }
};

const ObjectToJson = (val: Metadatum) => {
  const nativeValue = getNativeValue(val);
  if (nativeValue) return nativeValue;
  const listValue = getListValue(val);
  if (listValue) return listValue;
  return getDictValue(val);
};

export {
  ObjectToJson,
  getDictValue,
  getNativeValue,
  getListValue,
  getStringValue,
  getIntValue,
  getByteValue,
};

export type { JsonObject, ListObject, MetadataObject };
