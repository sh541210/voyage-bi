# bi_chart
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `bi_chart` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(32) DEFAULT NULL COMMENT '名称',
  `dashboard_id` bigint DEFAULT NULL COMMENT '仪表盘ID',
  `data_sheet_id` bigint DEFAULT NULL COMMENT '数据集ID',
  `type` varchar(16) DEFAULT NULL COMMENT '图表类型',
  `style_cfg` text NOT NULL COMMENT '样式配置',
  `cfg` text COMMENT '配置项',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  `group_id` bigint DEFAULT NULL COMMENT '组ID',
  `tip_text` varchar(512) DEFAULT NULL COMMENT '提示文本',
  `mobile_type` varchar(16) DEFAULT NULL COMMENT '移动端图表类型',
  `create_time` bigint NOT NULL DEFAULT '0' COMMENT '创建时间',
  `update_by` varchar(255) NOT NULL DEFAULT '' COMMENT '修改人',
  `update_time` bigint NOT NULL DEFAULT '0' COMMENT '修改时间',
  `create_by` varchar(16) DEFAULT NULL COMMENT '创建人',
  PRIMARY KEY (`id`),
  KEY `key_dashboard_id` (`dashboard_id`),
  KEY `key_data_sheet_id` (`data_sheet_id`),
  KEY `key_group_id` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图表配置表';



# bi_chart_component
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `bi_chart_component` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(32) DEFAULT NULL COMMENT '名称',
  `description` text COMMENT '描述',
  `props` json DEFAULT NULL COMMENT '配置项（JSON格式）',
  `code` varchar(32) NOT NULL COMMENT '组件唯一标识',
  `enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否打开',
  `create_time` bigint NOT NULL DEFAULT '0' COMMENT '创建时间',
  `update_by` varchar(255) NOT NULL DEFAULT '' COMMENT '修改人',
  `update_time` bigint NOT NULL DEFAULT '0' COMMENT '修改时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除,0-未删除，1-删除',
  `create_by` varchar(32) NOT NULL DEFAULT '' COMMENT '创建人',
  `sort` int DEFAULT NULL COMMENT '顺序',
  `type` varchar(12) DEFAULT NULL COMMENT '组件类型',
  `icon` varchar(32) DEFAULT NULL COMMENT '组件图标',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图表组件表';



# bi_chart_group
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `bi_chart_group` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `title` varchar(255) NOT NULL COMMENT '标题',
  `sub_title` varchar(255) NOT NULL COMMENT '副标题',
  `dashboard_id` bigint unsigned NOT NULL COMMENT '仪表盘ID',
  `deleted` tinyint DEFAULT NULL COMMENT '是否删除：0-未删除，1-已删除',
  `group_type` varchar(16) NOT NULL DEFAULT '' COMMENT '组类型： TAB-标签页类型分组， GRID-网格类型分组',
  `cfg` text COMMENT '配置项（JSON格式）',
  `show_title` tinyint DEFAULT NULL COMMENT '是否显示标题：0-隐藏，1-显示',
  `custom_data` text COMMENT '自定义数据（JSON/文本格式）',
  `chart_ids` varchar(512) DEFAULT NULL COMMENT '关联的图表ID列表（逗号分隔）',
  `style_cfg` json NOT NULL COMMENT '样式配置（JSON格式）',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图表组表';



# bi_dashboard
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `bi_dashboard` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `cfg` text COMMENT '仪表盘配置（JSON格式）',
  `style_cfg` text COMMENT '样式配置（JSON格式）',
  `layout_cfg` text COMMENT '布局配置（JSON格式）',
  `name` varchar(64) DEFAULT NULL COMMENT '仪表盘名称',
  `description` varchar(64) DEFAULT NULL COMMENT '仪表盘描述',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  `type` varchar(16) NOT NULL DEFAULT '' COMMENT '类型',
  `app_id` bigint NOT NULL DEFAULT '0' COMMENT 'APP ID',
  `create_time` bigint NOT NULL DEFAULT '0' COMMENT '创建时间',
  `update_by` varchar(255) NOT NULL DEFAULT '' COMMENT '修改人',
  `update_time` bigint NOT NULL DEFAULT '0' COMMENT '修改时间',
  `create_by` varchar(16) DEFAULT NULL COMMENT '创建人',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='仪表盘表';



# bi_dashboard_share
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `bi_dashboard_share` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `dashboard_snapshot` json DEFAULT NULL COMMENT '仪表盘快照数据(JSON格式)',
  `data_sheet_snapshot` json DEFAULT NULL COMMENT '数据集快照(JSON格式)',
  `data_sheet_snapshots` json DEFAULT NULL COMMENT '多数据集快照(JSON格式)',
  `name` varchar(64) DEFAULT NULL COMMENT '分享名称',
  `theme_id` bigint DEFAULT NULL COMMENT '主题ID',
  `key` varchar(64) DEFAULT NULL COMMENT '分享唯一标识key',
  `dashboard_id` bigint DEFAULT NULL COMMENT '仪表盘ID',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  `enabled` tinyint(1) NOT NULL DEFAULT '0' COMMENT '开启',
  `app_id` bigint NOT NULL DEFAULT '0' COMMENT 'APP ID',
  `type` varchar(16) NOT NULL DEFAULT '' COMMENT '类型：DASHBOARD/REPORT',
  `create_time` bigint NOT NULL DEFAULT '0' COMMENT '创建时间',
  `update_by` varchar(255) NOT NULL DEFAULT '' COMMENT '修改人',
  `update_time` bigint NOT NULL DEFAULT '0' COMMENT '修改时间',
  `create_by` varchar(16) DEFAULT NULL COMMENT '创建人',
  `description` varchar(128) NOT NULL DEFAULT '' COMMENT '描述',
  PRIMARY KEY (`id`),
  KEY `key_dashboard_id` (`dashboard_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='仪表盘分享表';



# bi_data_sheet
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `bi_data_sheet` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `sql_text` text COMMENT 'SQL查询语句',
  `name` varchar(255) DEFAULT NULL COMMENT '数据集名称',
  `datasource_id` bigint DEFAULT NULL COMMENT '数据源ID',
  `sheet_type` varchar(16) DEFAULT NULL COMMENT '数据集类型(SQL/表/视图等)',
  `table_name` varchar(64) DEFAULT NULL COMMENT '物理表名(当sheet_type为表时使用)',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  `sheet_update_time` varchar(32) NOT NULL DEFAULT '' COMMENT '更新时间',
  `description` varchar(128) NOT NULL DEFAULT '' COMMENT '描述',
  `cfg` json DEFAULT NULL COMMENT '配置',
  `data_update_time` bigint DEFAULT NULL COMMENT '数据最后更新时间戳',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据集表';



# bi_data_sheet_column
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `bi_data_sheet_column` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `column_length` int DEFAULT NULL COMMENT '字段长度',
  `column_type` varchar(16) DEFAULT NULL COMMENT '字段类型',
  `comment` varchar(255) DEFAULT NULL COMMENT '字段注释',
  `data_sheet_id` bigint DEFAULT NULL COMMENT '数据集ID',
  `data_type` varchar(16) DEFAULT NULL COMMENT '数据类型',
  `description` varchar(255) DEFAULT NULL COMMENT '字段描述',
  `name` varchar(255) DEFAULT NULL COMMENT '字段名称',
  `origin_data_type` varchar(16) DEFAULT NULL COMMENT '原始数据类型',
  `origin_name` varchar(255) DEFAULT NULL COMMENT '原始字段名称',
  `origin_type` varchar(255) DEFAULT NULL COMMENT '原始字段类型',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  KEY `key_data_sheet_id` (`data_sheet_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据集列表';



# bi_datasource
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `bi_datasource` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `cfg_store` text COMMENT '数据源配置存储(JSON格式)',
  `name` varchar(255) DEFAULT NULL COMMENT '数据源名称',
  `type` varchar(16) DEFAULT NULL COMMENT '数据源类型',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  `description` varchar(128) NOT NULL DEFAULT '' COMMENT '描述',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据源表';



# bi_file_tree_node
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `bi_file_tree_node` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `create_time` bigint NOT NULL COMMENT '创建时间(时间戳)',
  `create_by` varchar(255) DEFAULT NULL COMMENT '创建人',
  `deleted` int DEFAULT NULL COMMENT '是否删除(0-未删除，1-已删除)',
  `update_by` varchar(255) DEFAULT NULL COMMENT '更新人',
  `update_time` bigint NOT NULL COMMENT '更新时间(时间戳)',
  `biz_ref_id` bigint DEFAULT NULL COMMENT '业务关联ID',
  `biz_type` varchar(16) NOT NULL DEFAULT '' COMMENT '类型',
  `biz_type_extra` varchar(255) DEFAULT NULL COMMENT '业务类型补充信息',
  `description` varchar(255) DEFAULT NULL COMMENT '节点描述',
  `name` varchar(255) DEFAULT NULL COMMENT '节点名称',
  `pid` bigint DEFAULT NULL COMMENT '父节点ID',
  `workspace_id` bigint DEFAULT NULL COMMENT '所属工作区ID',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件树节点表';



# bi_query_record
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `bi_query_record` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `create_by` varchar(255) DEFAULT NULL COMMENT '创建人',
  `create_time` bigint DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(255) DEFAULT NULL COMMENT '更新人',
  `update_time` bigint DEFAULT NULL COMMENT '更新时间',
  `start_time` bigint DEFAULT NULL COMMENT '查询开始时间',
  `end_time` bigint DEFAULT NULL COMMENT '查询结束时间',
  `submit_time` bigint DEFAULT NULL COMMENT '提交时间',
  `hit_cache` tinyint(1) DEFAULT NULL COMMENT '是否命中缓存',
  `datasource_id` bigint DEFAULT NULL COMMENT '数据源ID',
  `origin_sql` text COMMENT '原始SQL',
  `deleted` tinyint DEFAULT NULL COMMENT '是否删除(0-未删除，1-已删除)',
  `chart_id` bigint DEFAULT NULL COMMENT '关联的图表ID',
  `message` text COMMENT '查询结果/错误信息',
  `query_end_time` bigint DEFAULT NULL COMMENT '实际查询结束时间(时间戳)',
  `query_start_time` bigint DEFAULT NULL COMMENT '实际查询开始时间(时间戳)',
  `state` tinyint(1) DEFAULT NULL COMMENT '查询状态(0-失败，1-成功，2-执行中)',
  `source` varchar(16) NOT NULL DEFAULT '' COMMENT '来源',
  `data_sheet_id` bigint DEFAULT NULL COMMENT '关联的数据集ID',
  `env` varchar(32) DEFAULT NULL COMMENT '环境',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='查询记录表';



# bi_system_config
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `bi_system_config` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '配置项ID',
  `config_key` varchar(255) NOT NULL COMMENT '配置项名称，唯一',
  `config_value` text NOT NULL COMMENT '配置项值',
  `config_description` varchar(255) DEFAULT NULL COMMENT '配置项描述',
  `data_type` varchar(50) NOT NULL COMMENT '配置项数据类型（如：String, Integer, Boolean, JSON等）',
  `enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用：0-禁用, 1-启用',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  `create_time` bigint NOT NULL DEFAULT '0' COMMENT '创建时间',
  `update_by` varchar(255) NOT NULL DEFAULT '' COMMENT '修改人',
  `update_time` bigint NOT NULL DEFAULT '0' COMMENT '修改时间',
  `create_by` varchar(16) DEFAULT NULL COMMENT '创建人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';



# bi_theme
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `bi_theme` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `dashboard_style_cfg` text COMMENT '仪表板样式配置(JSON格式)',
  `name` varchar(64) DEFAULT NULL COMMENT '主题名称',
  `render_code` text COMMENT '主题渲染代码',
  `graph_render_type` varchar(16) DEFAULT NULL COMMENT '图形渲染类型(如ECharts/Ucharts等)',
  `deleted` tinyint(1) DEFAULT '0' COMMENT '逻辑删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='主题表';



# menu
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `menu` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(255) NOT NULL DEFAULT '' COMMENT '名称',
  `pid` bigint NOT NULL DEFAULT '0' COMMENT '父菜单',
  `props` json DEFAULT NULL COMMENT '菜单信息配置',
  `create_by` varchar(255) NOT NULL DEFAULT '' COMMENT '创建人',
  `create_time` bigint NOT NULL DEFAULT '0' COMMENT '创建时间',
  `update_by` varchar(255) NOT NULL DEFAULT '' COMMENT '修改人',
  `update_time` bigint NOT NULL DEFAULT '0' COMMENT '修改时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除,0-未删除，1-删除',
  PRIMARY KEY (`id`),
  KEY `pid_index` (`pid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单表';



# role
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `role` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(255) NOT NULL DEFAULT '' COMMENT '名称',
  `create_by` varchar(255) NOT NULL DEFAULT '' COMMENT '创建人',
  `create_time` bigint NOT NULL DEFAULT '0' COMMENT '创建时间',
  `update_by` varchar(255) NOT NULL DEFAULT '' COMMENT '修改人',
  `update_time` bigint NOT NULL DEFAULT '0' COMMENT '修改时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除,0-未删除，1-删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';



# role_menu
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `role_menu` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `role_id` bigint NOT NULL DEFAULT '0' COMMENT '角色ID',
  `menu_id` bigint NOT NULL DEFAULT '0' COMMENT '菜单ID',
  PRIMARY KEY (`id`),
  KEY `menu_id_index` (`menu_id`),
  KEY `role_id_index` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色菜单关系表';



# user
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(255) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `create_by` varchar(255) NOT NULL DEFAULT '' COMMENT '创建人',
  `create_time` bigint NOT NULL DEFAULT '0' COMMENT '创建时间',
  `update_by` varchar(255) NOT NULL DEFAULT '' COMMENT '修改人',
  `update_time` bigint NOT NULL DEFAULT '0' COMMENT '修改时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '逻辑删除,0-未删除，1-删除',
  `avatar_img_url` varchar(512) NOT NULL DEFAULT '' COMMENT '头像链接',
  `email` varchar(64) NOT NULL DEFAULT '' COMMENT '邮箱',
  `nickname` varchar(64) NOT NULL DEFAULT '' COMMENT '名称',
  `gender` tinyint(1) NOT NULL DEFAULT '0' COMMENT '性别',
  `state` tinyint(1) NOT NULL DEFAULT '0' COMMENT '状态',
  `mobile` varchar(16) NOT NULL DEFAULT '' COMMENT '手机号',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';



# user_role
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `user_role` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `role_id` bigint NOT NULL DEFAULT '0' COMMENT '角色ID',
  `user_id` bigint NOT NULL DEFAULT '0' COMMENT '用户ID',
  PRIMARY KEY (`id`),
  KEY `role_id_index` (`role_id`),
  KEY `user_id_index` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关系表';