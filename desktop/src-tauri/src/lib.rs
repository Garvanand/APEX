// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn toggle_dnd(enabled: bool) -> Result<String, String> {
    println!("Tauri Command: toggle_dnd -> {}", enabled);
    // On Windows, DND can be simulated or set via Focus Assist settings,
    // here we return a clean confirmation status.
    Ok(format!("OS Focus Mode / DND successfully {}", if enabled { "enabled" : "disabled" }))
}

#[tauri::command]
async fn block_process(process_name: String) -> Result<String, String> {
    println!("Tauri Command: block_process -> {}", process_name);
    // Simulates process termination or app blocking.
    // In production, we'd use sysinfo crate or std::process Command to taskkill.
    Ok(format!("Application process '{}' has been blacklisted and blocked.", process_name))
}

#[tauri::command]
async fn arrange_workspace(layout: String) -> Result<String, String> {
    println!("Tauri Command: arrange_workspace -> {}", layout);
    // Simulates tiling window manager actions (e.g. side-by-side or fullscreen grid).
    Ok(format!("Workspace layout rearranged to template: '{}'", layout))
}

#[tauri::command]
async fn get_running_processes() -> Result<Vec<String>, String> {
    // Return a mocked list of active processes to display in App blockers UI
    Ok(vec![
        "discord.exe".to_string(),
        "spotify.exe".to_string(),
        "chrome.exe".to_string(),
        "msedge.exe".to_string(),
        "whatsapp.exe".to_string(),
        "code.exe".to_string(),
        "cmd.exe".to_string(),
    ])
}

#[tauri::command]
async fn trigger_greyscale_mode(enabled: bool) -> Result<String, String> {
    println!("Tauri Command: trigger_greyscale_mode -> {}", enabled);
    Ok(format!("Greyscale color filter matrix {}", if enabled { "activated" : "deactivated" }))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            toggle_dnd,
            block_process,
            arrange_workspace,
            get_running_processes,
            trigger_greyscale_mode
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
