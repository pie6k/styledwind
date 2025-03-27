export type JSONPrimitive = string | number | boolean | null;
export type JSONArray = JSONValue[];
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export interface JSONObject {
  [key: string]: JSONValue;
}
