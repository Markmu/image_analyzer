#!/bin/bash

# 批量替换硬编码颜色为 CSS 变量
# 执行此脚本前请确保已备份代码

echo "开始替换硬编码颜色为 CSS 变量..."

# 定义替换规则
declare -A replacements=(
    # 白色文字
    ["color: '#F8FAFC'"]="color: 'var(--glass-text-white-heavy)'"
    ["color: '#f8fafc'"]="color: 'var(--glass-text-white-heavy)'"
    ["color: \"#F8FAFC\""]="color: 'var(--glass-text-white-heavy)'"

    # 银灰色文字
    ["color: '#94A3B8'"]="color: 'var(--glass-text-gray-heavy)'"
    ["color: '#94a3b8'"]="color: 'var(--glass-text-gray-heavy)'"
    ["color: '#CBD5E1'"]="color: 'var(--glass-text-gray-medium)'"
    ["color: '#cbd5e1'"]="color: 'var(--glass-text-gray-medium)'"

    # 中等白色文字
    ["color: '#E2E8F0'"]="color: 'var(--glass-text-white-medium)'"
    ["color: '#e2e8f0'"]="color: 'var(--glass-text-white-medium)'"

    # 深灰色文字
    ["color: '#475569'"]="color: 'var(--glass-text-gray-heavy)'"
    ["color: '#334155'"]="color: 'var(--glass-text-gray-heavy)'"

    # 蓝色
    ["color: '#3B82F6'"]="color: 'var(--glass-text-primary)'"
    ["color: \"#3B82F6\""]="color: 'var(--glass-text-primary)'"

    # 绿色（应改为蓝色）
    ["color: '#4caf50'"]="color: 'var(--success)'"
    ["color: '#22c55e'"]="color: 'var(--glass-text-primary)'"
    ["bgcolor: '#16A34A'"]="bgcolor: 'var(--primary-active)'"
    ["color: '#052e16'"]="color: 'var(--glass-text-white-heavy)'"

    # 橙色/警告色
    ["color: '#ff9800'"]="color: 'var(--warning)'"
    ["color: '#F59E0B'"]="color: 'var(--warning)'"
    ["color: '#FBBF24'"]="color: 'var(--warning)'"

    # 红色/错误色
    ["color: '#f44336'"]="color: 'var(--error)'"
    ["color: '#EF4444'"]="color: 'var(--error)'"

    # 背景/前景色
    ["background: 'var(--color-background)'"]="background: 'var(--background)'"
    ["color: 'var(--color-text)'"]="color: 'var(--foreground)'"
)

# 遍历所有 .tsx 和 .ts 文件
find /Users/muchao/code/image_analyzer/src -type f \( -name "*.tsx" -o -name "*.ts" \) | while read -r file; do
    for old in "${!replacements[@]}"; do
        new="${replacements[$old]}"
        sed -i '' "s/${old}/${new}/g" "$file"
    done
done

echo "✅ 硬编码颜色替换完成！"
