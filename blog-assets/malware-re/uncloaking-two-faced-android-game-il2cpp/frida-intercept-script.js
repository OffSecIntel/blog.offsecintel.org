/**
 * Frida Interception Script for com.circlelanes.trains
 * Target: Unity Native IL2CPP Metadata Cloaking Verification
 */
import "frida-il2cpp-bridge";

const FAKE_APPSFLYER_DATA = JSON.stringify({
    "af_status": "Non-organic",
    "media_source": "googleadwords_int",
    "campaign": "youtube_covert_rm_01",
    "+5_first_launch": true
});

Il2Cpp.perform(() => {
    console.log("[OffSecIntel] Hooking native IL2CPP libraries...");

    const FirebaseManager = Il2Cpp.Domain.assembly("Assembly-CSharp").image.class("Main.FirebaseManager");
    const PlayerPrefs = Il2Cpp.Domain.assembly("UnityEngine.CoreModule").image.class("UnityEngine.PlayerPrefs");
    const NetworkResponse = Il2Cpp.Domain.assembly("Assembly-CSharp").image.class("Main.NetworkResponse");
    const AssetBundle = Il2Cpp.Domain.assembly("UnityEngine.AssetBundleModule").image.class("UnityEngine.AssetBundle");

    // 1. Force malicious flow by spoofing AppsFlyer attribution callbacks
    FirebaseManager.method("onConversionDataSuccess").implementation = function (instance, originalJSON) {
        console.log("[OffSecIntel] onConversionDataSuccess callback intercepted!");
        console.log("[OffSecIntel] Original payload: " + originalJSON);
        console.log("[OffSecIntel] Injecting non-organic attribution vector...");
        return this.open(FAKE_APPSFLYER_DATA);
    };

    // 2. Audit persistence layer bridge
    PlayerPrefs.method("SetString").implementation = function (key, value) {
        console.log(`[OffSecIntel] PlayerPrefs.SetString written: Key=${key}, Value=${value}`);
        return this(key, value);
    };

    // 3. Extract uncloaked C2 responses
    NetworkResponse.method("get_Text").implementation = function () {
        const responseText = this();
        console.log("[OffSecIntel] Decrypted C2 server payload text: " + responseText);
        return responseText;
    };

    // 4. Trace WebSocket stream byte length
    AssetBundle.method("LoadFromMemoryAsync").implementation = function (bytes) {
        console.log("[OffSecIntel] AssetBundle.LoadFromMemoryAsync intercepted!");
        console.log(`[OffSecIntel] Reassembled memory buffer stream size: ${bytes.length} bytes`);
        return this(bytes);
    };
});
