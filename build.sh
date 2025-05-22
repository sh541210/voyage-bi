#!/bin/bash

# 设置错误检测功能
set -e

# 错误处理函数
function handle_error() {
    local error_msg="$1"
    echo "错误: $error_msg"
    exit 1
}

# 在发生错误时调用错误处理函数
trap 'handle_error "$BASH_COMMAND"' ERR

# 检查是否跳过前端编译
SKIP_FRONTEND=false
for arg in "$@"
do
    if [ "$arg" == "--skip-frontend" ]; then
        SKIP_FRONTEND=true
    fi
done

# 执行前端编译（除非跳过）
if [ "$SKIP_FRONTEND" = false ]; then
    echo "正在编译前端..."
    cd web-ui || handle_error "进入目录失败"
    yarn build || handle_error "yarn构建失败"
    rm -rf ../web-server/src/main/resources/static/*
    cp -r dist/* ../web-server/src/main/resources/static || handle_error "复制文件失败"
    cd .. || handle_error "返回目录失败"
else
    echo "跳过前端编译"
fi

# 使用Maven编译Java代码并打包成jar文件
echo "正在编译后端..."
mvn clean package -DskipTests || handle_error "Maven编译失败"

# 添加文件到git暂存区
git add ./web-server
git add ./web-ui

echo "编译完成"