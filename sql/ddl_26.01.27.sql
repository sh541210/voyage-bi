-- 节点加锁功能
ALTER TABLE `bi_file_tree_node`
    ADD COLUMN `locked` tinyint DEFAULT '0' COMMENT '是否加锁',
ADD COLUMN `lock_user_id` varchar(32) COMMENT '加锁用户',
ADD COLUMN `lock_time` bigint DEFAULT '0' COMMENT '加锁时间';