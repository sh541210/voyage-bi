package top.fusb.voyagebi.service;

public interface ShareTokenService {

    boolean checkToken(String token, String shareKey);

    String generateToken(String key);
}
