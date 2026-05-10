/*
  ORION — ejemplo UNO R4 WiFi → Supabase (RPC normalizado)
  1) Creá el proyecto en supabase.com, ejecutá database/schema.sql y database/migrations/002_normalized_telemetry.sql
  2) Copiá URL del proyecto y anon key (Settings → API)
  3) Completá WIFI_* y SUPABASE_* abajo
  4) Ajustá la lógica de medición (sensores, millis(), etc.) y llamá sendRun() cuando tengas los números

  Envía a POST /rest/v1/rpc/create_run_complete con cuerpo {"payload":{...}} (mismos campos que el laboratorio).

  Formato de líneas serie (compatible con el pegado en el laboratorio):
  S1:0.452  S2:0.448  TOT:1.105  REACT:180  MODELO:MiAuto
*/

#include <WiFi.h>
#include <WiFiSSLClient.h>

const char* WIFI_SSID = "TU_WIFI";
const char* WIFI_PASS = "TU_CLAVE";

const char* SUPABASE_HOST = "xxxxxxxx.supabase.co";  // sin https://
const char* SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....";
const char* DEVICE_ID = "uno-r4-01";

WiFiSSLClient client;

String escapeJson(const char* s) {
  String out;
  if (!s) return out;
  for (const char* p = s; *p; p++) {
    if (*p == '"' || *p == '\\') out += '\\';
    out += *p;
  }
  return out;
}

bool connectWifi() {
  if (WiFi.status() == WL_CONNECTED) return true;
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 20000) {
    delay(300);
  }
  return WiFi.status() == WL_CONNECTED;
}

bool postToPath(const char* path, const String& jsonBody) {
  if (!client.connect(SUPABASE_HOST, 443)) return false;

  client.println("POST " + String(path) + " HTTP/1.1");
  client.println("Host: " + String(SUPABASE_HOST));
  client.println("Connection: close");
  client.println("Content-Type: application/json");
  client.println("apikey: " + String(SUPABASE_ANON_KEY));
  client.println("Authorization: Bearer " + String(SUPABASE_ANON_KEY));
  client.println("Prefer: return=representation");
  client.print("Content-Length: ");
  client.println(jsonBody.length());
  client.println();
  client.println(jsonBody);

  unsigned long t0 = millis();
  while (client.connected() && millis() - t0 < 15000) {
    if (client.available()) {
      char c = client.read();
      Serial.write(c);
    }
  }
  client.stop();
  return true;
}

/**
 * Crea runs + sensor_measurements; Postgres calcula calculated_metrics (v=L/t, etc.).
 * trackLenM: longitud de pista en metros (ej. 20).
 */
void sendRun(float totSec, float reactMs, float s1, float s2, const char* oil, const char* carModel, float trackLenM) {
  if (!connectWifi()) {
    Serial.println(F("WiFi falló"));
    return;
  }

  String inner = "{";
  inner += "\"source\":\"arduino\",";
  inner += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  inner += "\"total_time_sec\":" + String(totSec, 4) + ",";
  inner += "\"sensor_s1_sec\":" + String(s1, 6) + ",";
  inner += "\"sensor_s2_sec\":" + String(s2, 6) + ",";
  inner += "\"reaction_times_ms\":[" + String(reactMs, 2) + "],";
  inner += "\"lap_times_sec\":[],";
  inner += "\"oil_type\":\"" + escapeJson(oil) + "\",";
  inner += "\"car_model\":\"" + escapeJson(carModel) + "\",";
  inner += "\"track_length_m\":" + String(trackLenM > 0 ? trackLenM : 20.0f, 4);
  inner += ",\"telemetry_payload\":{}}";

  String body = "{\"payload\":" + inner + "}";

  Serial.println(F("Enviando create_run_complete..."));
  postToPath("/rest/v1/rpc/create_run_complete", body);
  Serial.println();
}

void setup() {
  Serial.begin(115200);
  delay(800);
  Serial.println(F("ORION UNO R4 WiFi — listo (RPC normalizado)"));
}

void loop() {
  // Demo: descomentá para probar una vez con valores ficticios (pista ~20 m)
  /*
  sendRun(1.105f, 180.0f, 0.452f, 0.448f, "5W-30", "Proto", 20.0f);
  delay(60000);
  */
}
