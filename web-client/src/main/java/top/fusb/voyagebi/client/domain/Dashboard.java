package top.fusb.voyagebi.client.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.io.Serializable;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Dashboard implements Serializable {
    private Long id;
    private String name;
    private String description;
    private String key;
    /**
     * 类型 DASHBOARD/REPORT
     */
    private String type;
    private Boolean enabled;
}
