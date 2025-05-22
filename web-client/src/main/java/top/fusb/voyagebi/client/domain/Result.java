package top.fusb.voyagebi.client.domain;

import lombok.Data;

import java.io.Serializable;

@Data
public class Result<T> implements Serializable {
    private boolean success;
    private String code;
    private String message;
    private T data;
}