// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{Manager, LogicalSize, RunEvent};
use tauri::tray::TrayIconBuilder;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn show_overlay_window(app: tauri::AppHandle) -> Result<(), String> {
    // Hide main window when overlay is shown
    if let Some(main) = app.get_webview_window("main") {
        let _ = main.hide();
    }
    if let Some(overlay) = app.get_webview_window("overlay") {
        // Force correct dimensions (window-state plugin may have saved wrong size)
        let _ = overlay.set_size(LogicalSize::new(560.0, 400.0));
        overlay.show().map_err(|e| e.to_string())?;
        overlay.center().map_err(|e| e.to_string())?;
        overlay.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn hide_overlay_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(overlay) = app.get_webview_window("overlay") {
        overlay.hide().map_err(|e| e.to_string())?;
    }
    // Restore main window when overlay is hidden (e.g. Escape key)
    if let Some(main) = app.get_webview_window("main") {
        let _ = main.show();
        let _ = main.set_focus();
    }
    Ok(())
}

#[tauri::command]
fn close_overlay_window(app: tauri::AppHandle) -> Result<(), String> {
    eprintln!("[Rust] close_overlay_window called");
    if let Some(overlay) = app.get_webview_window("overlay") {
        overlay.hide().map_err(|e| e.to_string())?;
    }
    // Restore main window after overlay closes
    if let Some(main) = app.get_webview_window("main") {
        let _ = main.show();
        let _ = main.set_focus();
    }
    Ok(())
}

#[tauri::command]
fn show_popover_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(popover) = app.get_webview_window("popover") {
        popover.show().map_err(|e| e.to_string())?;
        popover.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn hide_popover_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(popover) = app.get_webview_window("popover") {
        popover.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn set_dock_visible(_app: tauri::AppHandle, _visible: bool) -> Result<(), String> {
    // macOS specific: hide/show dock icon
    // This is a simplified implementation
    // In production, you would use cocoa/objc bindings
    Ok(())
}

#[tauri::command]
fn register_global_shortcut(app: tauri::AppHandle, shortcut: String) -> Result<(), String> {
    let shortcut: Shortcut = shortcut
        .parse()
        .map_err(|e| format!("Failed to parse shortcut: {}", e))?;
    let app_handle = app.clone();
    app.global_shortcut()
        .on_shortcut(shortcut, move |_app, _shortcut, event| {
            if event.state == ShortcutState::Pressed {
                let _ = show_overlay_window(app_handle.clone());
            }
        })
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn unregister_global_shortcut(app: tauri::AppHandle, shortcut: String) -> Result<(), String> {
    let shortcut: Shortcut = shortcut
        .parse()
        .map_err(|e| format!("Failed to parse shortcut: {}", e))?;
    app.global_shortcut()
        .unregister(shortcut)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_positioner::init())
        .setup(|app| {
            // Force windows to use default dimensions from config
            if let Some(main) = app.get_webview_window("main") {
                let _ = main.set_size(LogicalSize::new(960.0, 640.0));
                let _ = main.set_min_size(Some(LogicalSize::new(960.0, 640.0)));
            }
            if let Some(overlay) = app.get_webview_window("overlay") {
                let _ = overlay.set_size(LogicalSize::new(560.0, 400.0));
            }

            // Create tray icon
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("CommandDeck")
                .on_tray_icon_event(|tray_icon, event| {
                    match event {
                        tauri::tray::TrayIconEvent::Click { .. } => {
                            let app = tray_icon.app_handle();
                            // Show and focus main window
                            if let Some(main) = app.get_webview_window("main") {
                                let _ = main.show();
                                let _ = main.unminimize();
                                let _ = main.set_focus();
                            }
                        }
                        _ => {}
                    }
                })
                .build(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            show_overlay_window,
            hide_overlay_window,
            close_overlay_window,
            show_popover_window,
            hide_popover_window,
            set_dock_visible,
            register_global_shortcut,
            unregister_global_shortcut
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            if let RunEvent::Reopen { .. } = event {
                // macOS dock icon clicked — show main window
                if let Some(main) = app_handle.get_webview_window("main") {
                    let _ = main.show();
                    let _ = main.set_focus();
                }
            }
        });
}
