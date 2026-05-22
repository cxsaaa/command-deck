# DESIGN.md

```yaml
meta:
  project: "Mac 命令速查应用"
  version: "0.2"
  document_type: "design_system_spec"
  target: "mac_desktop_app"
  purpose: "约束 UI 样式、布局、组件与交互，避免多次开发出现样式差异"

product_context:
  app_type: "developer_command_quick_reference"
  primary_flow:
    - "选择平台"
    - "浏览命令"
    - "搜索命令"
    - "一键复制"
  product_positioning:
    do: "命令速查工具"
    avoid: "命令管理后台"

principles:
  priority_order:
    - "search_first"
    - "platform_navigation_first"
    - "command_display_first"
    - "copy_action_first"
    - "crud_secondary"
    - "low_visual_noise"
    - "mac_native_feeling"
  ui_keywords:
    - "清晰"
    - "克制"
    - "高效"
    - "轻量"
    - "低干扰"
    - "稳定"
  must:
    - "搜索框始终处于主界面高优先级位置"
    - "平台导航必须清晰可扫视"
    - "命令卡片必须突出命令内容和复制按钮"
    - "新增、编辑、删除必须弱化"
    - "所有页面必须使用统一 Token 和组件"
  must_not:
    - "主界面后台化"
    - "命令列表表格化"
    - "卡片中堆叠多个主按钮"
    - "随意新增颜色、字号、圆角、阴影、间距"
    - "大面积使用平台色"

layout:
  app:
    min_width: 960
    min_height: 640
    background: "color.bg.app"
    structure:
      - "top_bar"
      - "sidebar"
      - "content"
  top_bar:
    height: 44
    padding_x: "space.6"
    padding_y: "space.0"
    border_bottom: "1px solid color.border.default"
    layout:
      display: "flex"
      align_items: "center"
      gap: "space.4"
    allowed_items:
      - "app_title"
      - "search_input"
      - "new_command_button"
      - "settings_button"
    max_primary_actions: 1
  sidebar:
    width: 220
    min_width: 200
    max_width: 260
    padding: "space.3"
    background: "color.bg.subtle"
    border_right: "1px solid color.border.default"
    sections:
      quick:
        title: "快捷入口"
        items:
          - "全部命令"
          - "收藏"
          - "最近使用"
      platforms:
        title: "平台"
        items_source: "platforms"
  content:
    padding: "space.6"
    background: "color.bg.app"
    max_card_width: 860
    structure:
      - "content_header"
      - "category_tabs"
      - "command_list"
  command_list:
    display: "flex"
    direction: "column"
    gap: "space.2"
    max_width: 860
    width: "100%"

breakpoints:
  desktop_min:
    width: 960
    behavior: "full_layout"
  compact:
    width_less_than: 900
    behavior: "sidebar_may_collapse"
    required_in_v1: false

tokens:
  color:
    bg:
      app:
        light: "#F5F5F7"
        dark: "#111827"
      surface:
        light: "#FFFFFF"
        dark: "#1F2937"
      subtle:
        light: "#F9FAFB"
        dark: "#182230"
      hover:
        light: "#F2F4F7"
        dark: "#263244"
      active:
        light: "#EDEFF3"
        dark: "#344054"
    border:
      default:
        light: "#E5E7EB"
        dark: "#344054"
      strong:
        light: "#D0D5DD"
        dark: "#475467"
    text:
      primary:
        light: "#101828"
        dark: "#F9FAFB"
      secondary:
        light: "#475467"
        dark: "#D0D5DD"
      tertiary:
        light: "#667085"
        dark: "#98A2B3"
      placeholder:
        light: "#98A2B3"
        dark: "#667085"
      inverse:
        light: "#FFFFFF"
        dark: "#101828"
    accent:
      default:
        light: "#2563EB"
        dark: "#60A5FA"
      hover:
        light: "#1D4ED8"
        dark: "#3B82F6"
      active:
        light: "#1E40AF"
        dark: "#2563EB"
      soft:
        light: "#EFF6FF"
        dark: "#172554"
      border:
        light: "#BFDBFE"
        dark: "#1D4ED8"
    state:
      success:
        default: "#16A34A"
        soft: "#ECFDF3"
      warning:
        default: "#D97706"
        soft: "#FFFAEB"
      danger:
        default: "#DC2626"
        soft: "#FEF2F2"
    platform:
      docker: "#2496ED"
      claude_code: "#7C3AED"
      cli: "#64748B"
      open_code: "#10B981"
      git: "#F97316"
      kubernetes: "#326CE5"
      homebrew: "#FBBF24"
      nodejs: "#339933"
      python: "#3776AB"
      shell: "#52525B"
  typography:
    font_family:
      ui: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
      title: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
      mono: "'SF Mono', Menlo, Monaco, Consolas, monospace"
    font_size:
      xs:
        size: 12
        line_height: 16
      sm:
        size: 13
        line_height: 18
      base:
        size: 14
        line_height: 20
      md:
        size: 15
        line_height: 22
      lg:
        size: 18
        line_height: 26
      xl:
        size: 22
        line_height: 30
    font_weight:
      regular: 400
      medium: 500
      semibold: 600
    forbidden_weights:
      - 700
      - 800
      - 900
  space:
    0: 0
    1: 4
    2: 8
    3: 12
    4: 16
    5: 20
    6: 24
    8: 32
    10: 40
    forbidden_values:
      - 5
      - 7
      - 9
      - 11
      - 13
      - 17
      - 19
      - 23
  radius:
    sm: 6
    md: 8
    lg: 12
    xl: 16
    full: 999
  shadow:
    none: "none"
    sm: "0 1px 2px rgba(16, 24, 40, 0.06)"
    md: "0 4px 12px rgba(16, 24, 40, 0.08)"
    lg: "0 12px 24px rgba(16, 24, 40, 0.12)"
  motion:
    duration:
      fast: "120ms"
      base: "160ms"
      slow: "220ms"
    easing:
      standard: "cubic-bezier(0.2, 0, 0, 1)"
    allowed:
      - "hover_background_transition"
      - "button_active_scale"
      - "modal_fade_scale"
      - "toast_fade"
      - "selected_state_transition"
    forbidden:
      - "large_bounce"
      - "card_flip"
      - "heavy_gradient_animation"
      - "long_loading_animation"

components:
  app_shell:
    composition:
      - "TopBar"
      - "Sidebar"
      - "Content"
    background: "color.bg.app"

  search_input:
    priority: "p0"
    placement: "top_bar"
    always_visible: true
    placeholder: "搜索命令、描述、标签、参数..."
    shortcut_hint: "⌘K"
    size:
      height: 30
      min_width: 280
      max_width: 520
      radius: "radius.md"
      padding_x: "space.2.5"
      gap: "space.1.5"
    typography:
      font_size: "typography.font_size.sm"
      font_weight: "typography.font_weight.regular"
    state:
      default:
        background: "color.bg.surface"
        border: "1px solid color.border.default"
        text: "color.text.primary"
        placeholder: "color.text.placeholder"
      hover:
        border: "1px solid color.border.strong"
      focus:
        border: "1px solid color.accent.default"
        ring: "0 0 0 3px rgba(37, 99, 235, 0.12)"
    behavior:
      search_scope_default: "current_platform"
      allow_global_switch: true

  sidebar_section_title:
    size:
      margin_top: "space.4"
      margin_bottom: "space.2"
    typography:
      font_size: "typography.font_size.xs"
      font_weight: "typography.font_weight.medium"
      color: "color.text.tertiary"

  platform_item:
    size:
      height: 34
      padding_x: "space.3"
      padding_y: "space.2"
      radius: "radius.md"
      gap: "space.2"
    layout:
      display: "flex"
      align_items: "center"
      justify_content: "space-between"
    color_dot:
      enabled: true
      size: 8
      radius: "radius.full"
      source: "tokens.color.platform"
    count:
      visible: true
      typography:
        font_size: "typography.font_size.xs"
        color: "color.text.tertiary"
    state:
      default:
        background: "transparent"
        text: "color.text.secondary"
      hover:
        background: "color.bg.hover"
        text: "color.text.primary"
      selected:
        background: "color.bg.active"
        text: "color.text.primary"
        font_weight: "typography.font_weight.medium"

  content_header:
    structure:
      - "title_row"
      - "category_tabs"
    title:
      typography:
        font_size: "typography.font_size.lg"
        font_weight: "typography.font_weight.semibold"
        color: "color.text.primary"
    count_text:
      typography:
        font_size: "typography.font_size.sm"
        color: "color.text.tertiary"

  category_tabs:
    source: "current_platform.categories"
    includes_all_tab: true
    size:
      height: 30
      padding_x: "space.3"
      padding_y: "space.1"
      gap: "space.2"
      radius: "radius.full"
    typography:
      font_size: "typography.font_size.sm"
      font_weight: "typography.font_weight.medium"
    state:
      default:
        background: "transparent"
        text: "color.text.secondary"
        border: "none"
      hover:
        background: "color.bg.hover"
        text: "color.text.primary"
      selected:
        background: "color.accent.soft"
        text: "color.accent.default"
        border: "1px solid color.accent.border"

  command_card:
    priority: "p0"
    role: "primary_content_unit"
    width:
      max: 860
      value: "100%"
    size:
      padding: "space.3"
      radius: "radius.lg"
      gap: "space.2"
    style:
      background: "color.bg.surface"
      border: "1px solid color.border.default"
      shadow: "shadow.none"
    structure:
      - "header"
      - "code_block"
      - "description"
      - "footer"
    header:
      left: "title"
      right:
        - "favorite_icon_button"
        - "more_menu_button"
    title:
      typography:
        font_size: "typography.font_size.md"
        font_weight: "typography.font_weight.semibold"
        color: "color.text.primary"
      overflow:
        white_space: "nowrap"
        overflow: "hidden"
        text_overflow: "ellipsis"
    code_block:
      font_family: "typography.font_family.mono"
      typography:
        font_size: "typography.font_size.xs"
        color: "color.text.primary"
      size:
        padding_x: "space.2.5"
        padding_y: 6
        radius: "radius.sm"
        max_lines_default: 2
      style:
        background: "color.bg.subtle"
        border: "1px solid color.border.default"
      overflow_behavior: "horizontal_scroll_or_expand"
    description:
      max_lines: 2
      typography:
        font_size: "typography.font_size.sm"
        color: "color.text.secondary"
        line_height: 18
    footer:
      content:
        - "platform"
        - "category"
        - "tags"
      separator: "·"
      typography:
        font_size: "typography.font_size.xs"
        color: "color.text.tertiary"
    primary_action:
      component: "copy_button"
      only_primary_action: true
    state:
      default:
        border: "1px solid color.border.default"
        shadow: "shadow.none"
      hover:
        border: "1px solid color.border.strong"
        shadow: "shadow.sm"
      selected:
        border: "1px solid color.accent.default"
        ring: "0 0 0 3px rgba(37, 99, 235, 0.10)"
      copied:
        copy_button_label: "已复制"
        duration: "1500ms"
    forbidden:
      - "delete_button_visible_in_card_main_area"
      - "edit_button_as_primary_action"
      - "multiple_primary_buttons"
      - "full_card_platform_color_background"

  copy_button:
    role: "primary_action"
    label:
      default: "复制"
      copied: "已复制"
    size:
      height: 24
      padding_x: 8
      radius: "radius.sm"
    typography:
      font_size: "typography.font_size.sm"
      font_weight: "typography.font_weight.medium"
    state:
      default:
        background: "color.accent.default"
        text: "color.text.inverse"
        border: "none"
      hover:
        background: "color.accent.hover"
      active:
        background: "color.accent.active"
        transform: "scale(0.98)"
      copied:
        background: "color.state.success.default"
        text: "#FFFFFF"
    behavior:
      on_click:
        - "copy_command_to_clipboard"
        - "show_toast_copied"
        - "increment_usage_count"
        - "update_last_used_at"

  icon_button:
    usage:
      - "favorite"
      - "more_menu"
      - "settings"
      - "close"
    size:
      width: 24
      height: 24
      radius: "radius.sm"
      icon_size: 16
    state:
      default:
        background: "transparent"
        color: "color.text.tertiary"
      hover:
        background: "color.bg.hover"
        color: "color.text.primary"
      active:
        background: "color.bg.active"
      focus:
        ring: "focus.ring.default"
    favorite:
      inactive:
        icon: "star_outline"
        color: "color.text.tertiary"
      active:
        icon: "star_filled"
        color: "color.state.warning.default"
        background: "transparent"

  more_menu:
    trigger: "icon_button"
    role: "secondary_actions"
    items_order:
      - id: "edit"
        label: "编辑"
      - id: "copy"
        label: "复制"
      - id: "favorite_toggle"
        label_variants:
          inactive: "收藏"
          active: "取消收藏"
      - id: "delete"
        label: "删除"
        danger: true
    style:
      background: "color.bg.surface"
      border: "1px solid color.border.default"
      shadow: "shadow.md"
      radius: "radius.lg"
      padding: "space.2"
    item:
      height: 32
      padding_x: "space.3"
      radius: "radius.md"
      typography:
        font_size: "typography.font_size.sm"
      danger:
        text: "color.state.danger.default"
        hover_background: "color.state.danger.soft"

  button:
    primary:
      usage:
        - "save"
        - "confirm"
      size:
        height: 28
        padding_x: 12
        radius: "radius.sm"
      typography:
        font_size: "typography.font_size.sm"
        font_weight: "typography.font_weight.medium"
      state:
        default:
          background: "color.accent.default"
          text: "color.text.inverse"
        hover:
          background: "color.accent.hover"
        active:
          background: "color.accent.active"
    secondary:
      usage:
        - "cancel"
        - "import"
        - "export"
        - "manage_platforms"
      size:
        height: 28
        padding_x: 12
        radius: "radius.sm"
      state:
        default:
          background: "color.bg.surface"
          border: "1px solid color.border.default"
          text: "color.text.secondary"
        hover:
          background: "color.bg.hover"
          text: "color.text.primary"
    danger:
      usage:
        - "confirm_delete"
      size:
        height: 28
        padding_x: 12
        radius: "radius.sm"
      state:
        default:
          background: "color.state.danger.default"
          text: "#FFFFFF"

  input:
    size:
      height: 36
      padding_x: "space.3"
      radius: "radius.md"
    typography:
      font_size: "typography.font_size.sm"
    state:
      default:
        background: "color.bg.surface"
        border: "1px solid color.border.default"
        text: "color.text.primary"
        placeholder: "color.text.placeholder"
      focus:
        border: "1px solid color.accent.default"
        ring: "0 0 0 3px rgba(37, 99, 235, 0.12)"
      error:
        border: "1px solid color.state.danger.default"
        text: "color.state.danger.default"

  textarea:
    extends: "input"
    size:
      min_height: 96
      padding_x: "space.3"
      padding_y: 10
    command_content_variant:
      font_family: "typography.font_family.mono"

  select:
    extends: "input"

  modal:
    usage:
      - "create_command"
      - "edit_command"
      - "confirm_delete"
    size:
      width: 560
      max_height: "80vh"
      padding: "space.6"
      radius: "radius.xl"
    style:
      background: "color.bg.surface"
      shadow: "shadow.lg"
    structure:
      - "header"
      - "body"
      - "footer"
    header:
      title:
        typography:
          font_size: "typography.font_size.lg"
          font_weight: "typography.font_weight.semibold"
          color: "color.text.primary"
      right: "close_icon_button"
    footer:
      alignment: "right"
      gap: "space.2"
      buttons_order:
        - "cancel"
        - "save_or_confirm"

  toast:
    position: "top_right"
    duration:
      copied: 1500
      default: 2200
    size:
      padding_x: 14
      padding_y: 10
      radius: "radius.lg"
    style:
      background: "color.bg.surface"
      border: "1px solid color.border.default"
      shadow: "shadow.md"
    typography:
      font_size: "typography.font_size.sm"
      color: "color.text.primary"
    variants:
      copied:
        text: "已复制"
      saved:
        text: "已保存"
      deleted:
        text: "已删除"

  empty_state:
    alignment: "center"
    max_width: 360
    title:
      typography:
        font_size: "typography.font_size.md"
        font_weight: "typography.font_weight.semibold"
        color: "color.text.primary"
    description:
      typography:
        font_size: "typography.font_size.sm"
        color: "color.text.tertiary"
    variants:
      search_no_result:
        title: "没有找到相关命令"
        description: "可以尝试使用更短关键词，或切换到全部平台搜索。"
        action: "+ 添加这条命令"
      platform_empty:
        title: "这个平台下还没有命令"
        description: "添加第一条命令后，它会显示在这里。"
        action: "新建命令"
      favorite_empty:
        title: "还没有收藏命令"
        description: "点击命令卡片上的星标后，命令会显示在这里。"
        action: null

forms:
  command_form:
    usage:
      - "create_command"
      - "edit_command"
    layout:
      type: "vertical"
      field_gap: "space.4"
    fields_order:
      - "title"
      - "platform"
      - "category"
      - "command"
      - "description"
      - "tags"
      - "examples"
      - "parameters"
      - "notes"
    required_fields:
      - "title"
      - "command"
      - "platform"
    recommended_fields:
      - "description"
      - "category"
    optional_fields:
      - "tags"
      - "examples"
      - "parameters"
      - "notes"
    label:
      typography:
        font_size: "typography.font_size.sm"
        font_weight: "typography.font_weight.medium"
        color: "color.text.primary"
      margin_bottom: 6
    helper_text:
      typography:
        font_size: "typography.font_size.xs"
        color: "color.text.tertiary"
    error_text:
      typography:
        font_size: "typography.font_size.xs"
        color: "color.state.danger.default"

pages:
  main:
    route: "/"
    layout: "app_shell"
    default_state: "platform_selected"
    primary_components:
      - "SearchInput"
      - "Sidebar"
      - "CategoryTabs"
      - "CommandList"
      - "CommandCard"
    forbidden_components:
      - "data_table_as_primary_command_view"
      - "persistent_right_detail_panel_in_v1"
  platform_view:
    content_header:
      title: "platform.name"
      count: "platform.command_count"
    filters:
      - "category_tabs"
    list: "commands_by_platform"
  search_view:
    trigger: "search_input_has_value"
    title_template: "搜索结果：{query}"
    scope_hint_template: "当前范围：{scope}"
    scope_switch:
      current_platform_to_global: "搜索全部平台"
      global_to_current_platform: "在当前平台搜索"
    list: "search_results_as_command_cards"
    empty_state: "empty_state.variants.search_no_result"
  favorites_view:
    title: "收藏"
    list: "favorite_commands"
    empty_state: "empty_state.variants.favorite_empty"
  recent_view:
    title: "最近使用"
    sort: "last_used_at_desc"
    list: "recent_commands"

search:
  priority: "p0"
  input_shortcut: "⌘K"
  default_scope_when_platform_selected: "current_platform"
  default_scope_when_all_selected: "global"
  searchable_fields:
    - "title"
    - "command"
    - "description"
    - "platform_name"
    - "category_name"
    - "tags"
    - "examples"
    - "parameters"
  ranking_weight:
    title_exact: 100
    command_match: 90
    tag_match: 70
    category_match: 60
    description_match: 50
    example_match: 40
    parameter_match: 40
    favorite_boost: 20
    recent_boost: 10
    usage_count_boost: 10
  keyboard_behavior:
    arrow_up: "select_previous_result"
    arrow_down: "select_next_result"
    enter: "copy_selected_command"
    escape:
      when_query_exists: "clear_query"
      when_modal_open: "close_modal"
  highlight:
    enabled_v1: false
    planned_style:
      background: "color.accent.soft"
      text: "color.accent.default"
      radius: "radius.sm"
      padding_x: 2

interactions:
  copy_command:
    trigger:
      - "click_copy_button"
      - "press_enter_on_selected_command"
    effects:
      - "write_command_to_clipboard"
      - "show_copied_toast"
      - "copy_button_label_to_copied"
      - "usage_count_plus_one"
      - "last_used_at_to_now"
      - "add_to_recent"
  platform_select:
    trigger: "click_platform_item"
    effects:
      - "set_current_platform"
      - "clear_category_filter_or_set_all"
      - "render_platform_commands"
  category_select:
    trigger: "click_category_tab"
    effects:
      - "set_current_category"
      - "filter_current_platform_commands"
  favorite_toggle:
    trigger: "click_star_icon"
    effects:
      - "toggle_is_favorite"
      - "update_favorites_view"
  edit_command:
    trigger: "more_menu.edit"
    presentation: "modal"
  delete_command:
    trigger: "more_menu.delete"
    requires_confirmation: true
    confirmation_text:
      title: "确定删除这条命令吗？"
      description: "删除后不可恢复。"
      cancel: "取消"
      confirm: "删除"

keyboard_shortcuts:
  command_k:
    keys: "⌘K"
    action: "focus_search_input"
  command_n:
    keys: "⌘N"
    action: "open_create_command_modal"
  escape:
    keys: "Esc"
    action_priority:
      - "close_modal"
      - "close_menu"
      - "clear_search"
  enter:
    keys: "Enter"
    context:
      search_has_selected_result: "copy_selected_command"
      modal_form: "submit_form_when_valid"
  arrow_up:
    keys: "↑"
    context:
      search_results: "select_previous_result"
  arrow_down:
    keys: "↓"
    context:
      search_results: "select_next_result"

icons:
  allowed_libraries:
    react_tauri:
      - "lucide-react"
    swiftui:
      - "SF Symbols"
  style:
    type: "linear"
    stroke_width: "library_default_or_1.75px"
  sizes:
    sidebar: 16
    button: 16
    empty_state: 32
    modal_close: 18
  forbidden:
    - "mix_multiple_icon_styles"
    - "filled_and_outline_random_mix_except_favorite"

copywriting:
  buttons:
    allowed:
      - "复制"
      - "已复制"
      - "保存"
      - "取消"
      - "编辑"
      - "删除"
      - "新建"
      - "导入"
      - "导出"
    forbidden_examples:
      - "点击这里复制"
      - "马上保存这个命令"
      - "进行编辑操作"
  search_placeholder: "搜索命令、描述、标签、参数..."
  delete_confirmation:
    title: "确定删除这条命令吗？"
    description: "删除后不可恢复。"

accessibility:
  keyboard_focus_required:
    - "search_input"
    - "platform_item"
    - "category_tab"
    - "command_card"
    - "copy_button"
    - "modal_button"
    - "menu_item"
  focus_ring:
    default: "0 0 0 3px rgba(37, 99, 235, 0.12)"
    border: "color.accent.default"
  contrast:
    important_text_must_not_use: "color.text.placeholder"
  disabled:
    opacity: 0.45
    cursor: "not-allowed"
    hover_effect: false

implementation:
  style_source: "design_tokens_only"
  hardcoded_values:
    allowed:
      - "rare_layout_exception_with_comment"
    forbidden:
      - "hardcoded_color"
      - "hardcoded_radius"
      - "hardcoded_shadow"
      - "random_spacing"
      - "component_specific_button_style"
  required_component_structure:
    components/layout:
      - "AppShell"
      - "TopBar"
      - "Sidebar"
    components/command:
      - "CommandCard"
      - "CommandList"
      - "CommandCodeBlock"
    components/platform:
      - "PlatformItem"
      - "PlatformList"
    components/search:
      - "SearchInput"
    components/common:
      - "Button"
      - "IconButton"
      - "Modal"
      - "Toast"
      - "EmptyState"
      - "MoreMenu"
      - "InputDialog"
  tailwind:
    allowed: true
    requirement: "tailwind.config 必须映射 tokens"
    arbitrary_values:
      allowed: "rare_layout_exception_only"
      forbidden_examples:
        - "bg-[#f7f7f7]"
        - "rounded-[13px]"
        - "p-[17px]"
  css_variables:
    required: true
    theme_switching_attribute: "data-theme"

css_variables_example:
  light: |
    :root {
      --color-bg-app: #F5F5F7;
      --color-bg-surface: #FFFFFF;
      --color-bg-subtle: #F9FAFB;
      --color-bg-hover: #F2F4F7;
      --color-bg-active: #EDEFF3;
      --color-border: #E5E7EB;
      --color-border-strong: #D0D5DD;
      --color-text-primary: #101828;
      --color-text-secondary: #475467;
      --color-text-tertiary: #667085;
      --color-text-placeholder: #98A2B3;
      --color-text-inverse: #FFFFFF;
      --color-accent: #2563EB;
      --color-accent-hover: #1D4ED8;
      --color-accent-active: #1E40AF;
      --color-accent-soft: #EFF6FF;
      --color-accent-border: #BFDBFE;
      --space-1: 4px;
      --space-2: 8px;
      --space-3: 12px;
      --space-4: 16px;
      --space-5: 20px;
      --space-6: 24px;
      --space-8: 32px;
      --space-10: 40px;
      --radius-sm: 6px;
      --radius-md: 8px;
      --radius-lg: 12px;
      --radius-xl: 16px;
      --radius-full: 999px;
      --color-highlight-bg: #e0f2fe;
      --color-highlight-text: #0369a1;
      --color-success-action: #10b981;
      --color-success-action-hover: #059669;
    }
  dark: |
    [data-theme="dark"] {
      --color-bg-app: #111827;
      --color-bg-surface: #1F2937;
      --color-bg-subtle: #182230;
      --color-bg-hover: #263244;
      --color-bg-active: #344054;
      --color-border: #344054;
      --color-border-strong: #475467;
      --color-text-primary: #F9FAFB;
      --color-text-secondary: #D0D5DD;
      --color-text-tertiary: #98A2B3;
      --color-text-placeholder: #667085;
      --color-text-inverse: #101828;
      --color-accent: #60A5FA;
      --color-accent-hover: #3B82F6;
      --color-accent-active: #2563EB;
      --color-accent-soft: #172554;
      --color-accent-border: #1D4ED8;
      --color-highlight-bg: #0369a1;
      --color-highlight-text: #e0f2fe;
    }

forbidden:
  visual:
    - "新增未登记颜色"
    - "新增未登记字号"
    - "新增未登记圆角"
    - "新增未登记阴影"
    - "不同页面按钮高度不一致"
    - "不同页面输入框样式不一致"
    - "平台色大面积铺底"
    - "使用高饱和渐变背景"
    - "混用多套图标库"
  interaction:
    - "双击卡片直接编辑"
    - "删除按钮直接显示在卡片主区域"
    - "复制后没有反馈"
    - "搜索框在主界面不可见"
    - "Enter 在搜索状态下触发未知行为"
    - "CRUD 操作压过复制操作"
  layout:
    - "第一版主界面使用复杂三栏"
    - "使用表格作为命令主展示"
    - "命令卡片无限拉伸到全屏宽"
    - "Sidebar 宽度在不同页面变化"
    - "页面 padding 在不同模块不一致"

acceptance_checklist:
  token_usage:
    - "颜色是否全部来自 tokens.color"
    - "间距是否全部来自 tokens.space"
    - "圆角是否全部来自 tokens.radius"
    - "阴影是否全部来自 tokens.shadow"
  component_usage:
    - "是否使用统一 Button 组件"
    - "是否使用统一 IconButton 组件"
    - "是否使用统一 SearchInput 组件"
    - "是否使用统一 CommandCard 组件"
    - "是否使用统一 Modal / Toast / EmptyState 组件"
  main_flow:
    - "搜索框是否高优先级展示"
    - "Sidebar 平台选中态是否一致"
    - "CommandCard 是否突出命令内容"
    - "CopyButton 是否是卡片唯一主操作"
    - "编辑 / 删除是否隐藏在 MoreMenu"
    - "删除是否二次确认"
  states:
    - "hover 状态是否一致"
    - "selected 状态是否一致"
    - "focus 状态是否可见"
    - "copied 状态是否有按钮反馈和 Toast"
    - "empty 状态是否给出下一步动作"
  themes:
    - "Light Mode 是否可读"
    - "Dark Mode 是否可读"
    - "平台色是否只用于小面积识别"

summary:
  ui_goal: "找到命令 → 理解命令 → 复制命令"
  style_goal: "搜索突出、平台清晰、卡片统一、复制显著、维护弱化、样式受控"
```

