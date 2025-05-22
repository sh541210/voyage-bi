package top.fusb.voyagebi.client.domain;

import lombok.Data;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

@Data
public class SheetDataGetParam implements Serializable {
    private Long id;
    private Map<String, Object> parameters;
    private String env;
    private boolean preview;
    private List<String> columns;
}