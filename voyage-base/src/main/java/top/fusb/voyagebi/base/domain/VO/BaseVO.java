package top.fusb.voyagebi.base.domain.VO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.example.server.user.domain.FillUserNickname;

/**
 * 基础视图对象
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class BaseVO implements FillUserNickname {
    /** 创建对象 */
    private String createBy;
    /** 更新对象 */
    private String updateBy;
    /** 更新时间 */
    private Long updateTime;
    /** 创建时间 */
    private Long createTime;
}
