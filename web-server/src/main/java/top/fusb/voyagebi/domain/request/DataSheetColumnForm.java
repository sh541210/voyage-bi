package top.fusb.voyagebi.domain.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import top.fusb.voyagebi.domain.enums.SheetColumnDataType;

import java.io.Serializable;

/**
 * 数据集列编辑表单
 */
@Data
public class DataSheetColumnForm implements Serializable {
    /** ID */
    private Long id;
    /** 描述 */
    private String description;
    /** 列数据类型 */
    @NotNull
    private SheetColumnDataType dataType;
}