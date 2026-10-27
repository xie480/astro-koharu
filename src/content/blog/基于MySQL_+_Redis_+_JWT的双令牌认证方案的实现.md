---
"title": "基于MySQL + Redis + JWT的双令牌认证方案的实现"
"link": "ji-yu-mysql_-_redis_-_jwtde-shuang-ling-pai-ren-zheng-fang-an-de-shi-xian"
"author": "Yilena"
"date": "2025-09-27"
"description": "本文针对单令牌认证机制存在的安全隐患与用户体验痛点，设计并实现了一套基于MySQL、Redis与JWT的双令牌（访问令牌+刷新令牌）认证方案。文章详细分析了双令牌机制的优势，通过分离认证与状态维护职责，结合Redis黑名单与分布式锁限流，有效提升了系统安全性。同时，提供了完整的Java代码实现，包括JWT工具类、Redis令牌管理服务、全局过滤器及业务层Controller逻辑，展示了如何优雅地处理令牌刷新、单点互斥登录及异常响应，为构建安全可靠的Web应用认证体系提供了实践参考。"
"cover": "https://i-blog.csdnimg.cn/direct/dcfedf4d751a4bb6a2744d2f5aae9f6c.png"
"tags":
  - "JWT"
  - "认证授权"
  - "架构设计"
"categories":
  - "业务拆解"
"sticky": false
"draft": false
"licenseName": "CC BY 4.0"
"sourceLink": "https://blog.csdn.net/2401_88959292/article/details/150224992?spm=1001.2014.3001.5501"
---

**目录**
 


[一、业务场景](#%E4%B8%80%E3%80%81%E4%B8%9A%E5%8A%A1%E5%9C%BA%E6%99%AF)
 


[二、分析](#%E4%BA%8C%E3%80%81%E5%88%86%E6%9E%90)
 


[三、具体实现](#%E4%B8%89%E3%80%81%E5%85%B7%E4%BD%93%E5%AE%9E%E7%8E%B0)
 


[（一）JWT 工具类](#%EF%BC%88%E4%B8%80%EF%BC%89JWT%E5%B7%A5%E5%85%B7%E7%B1%BB)
 


[（二）Redis 令牌管理](#%EF%BC%88%E4%BA%8C%EF%BC%89Redis%E4%BB%A4%E7%89%8C%E7%AE%A1%E7%90%86)
 


[（三）JWT 全局过滤器](#%EF%BC%88%E5%9B%9B%EF%BC%89JWT%E5%85%A8%E5%B1%80%E8%BF%87%E6%BB%A4%E5%99%A8)
 


[（四）业务层代码](#%EF%BC%88%E4%BA%94%EF%BC%89%E7%94%A8%E6%88%B7%E7%9B%B8%E5%85%B3Controller)
 


[四、补充](#%E5%9B%9B%E3%80%81%E8%A1%A5%E5%85%85)
 


---
 



 


## 一、业务场景
 


当前项目认证端点采用单令牌机制，该令牌存储在浏览器 LocalStorage 中存在安全风险，易遭泄露或窃取，存在潜在安全隐患。
 


我们需要设计一种新型认证方案，在保障用户隐私安全的同时，提供流畅的。
 


---
 


## 二、分析
 


让我们来刨析一下问题的根源，单令牌容易被窃取，一般窃取就是用来恶意攻击或者窃取隐私的，其原因有两个：一是令牌存储的位置不安全；二是令牌的存活时间过长，一旦被窃取很容易泄露隐私或者进行恶意攻击。
 


那我们如果把令牌的存活时间改短一点，这样即使泄露其拿来进行恶意攻击的时间也很短。但是虽说是很短但也还是存在操作空间，而且一旦用户注销或者修改了密码或者账户名后，原本的令牌虽说不会被使用，但因为还没过期所以还是生效的，对于这一令牌我们应该要禁止其使用，可以采取以位图的形式将其唯一标识存入拉入黑，在认证端点新增一个查询黑名单的校验功能，如果存在黑名单则驳回请求即可。
 


但是这样一来我们又有一个问题，就是 jwt 的存活时间太短了，用户需要频繁登录，体验很差。我们作为面向用户的应用肯定要以用户体验为重，那我们就得延长令牌的存活时间，但这样一来就回到上面的问题了：被拿来恶意攻击的时间会变得充裕，redis 黑名单也会体量膨胀。
 


如此，单令牌方案陷入了两难的地步。
 


那我们不妨再引入一个令牌？我们把用来认证的令牌作为访问令牌，存活时间短；再把用另一个令牌作为刷新令牌，用来刷新认证令牌的存活时间，把这个刷新令牌进行安全存储。
 


让两个令牌各司其职，访问令牌用来认证，二刷新令牌是用来维护用户的登陆状态的。
 


当用户修改密码或者注销时，直接把访问令牌加入 redis 黑名单即可，因为其存活时间短，也不会使得黑名单的体量膨胀。
 


可以说这种双令牌既保证了安全，同时也维护了良好的用户体验，是当前被广泛使用的一套方案。
 


将这套方案稍微完善一下，具体流程图如下：
 


![](https://i-blog.csdnimg.cn/direct/dcfedf4d751a4bb6a2744d2f5aae9f6c.png)
 


但是刚才的方案还存在一个问题：
 


我们用户的登录状态是由刷新令牌保障的，但是一旦刷新令牌过期，用户就需要重新登录了。也就是说，用户每隔一段时间就要重新登录一次，这样的体验也很不好，那么我们能不能自动地刷新刷新令牌呢？
 


所以我们在遇到异常时返回了两个不同的。
 


原方案里我们为了安全考虑，每次发起请求都是只携带访问令牌的，刷新令牌是安全存储在客户端的。如果在过滤器里面检测刷新令牌是否即将过期，那么我们就必须也携带刷新令牌，那这样的话安全就得不到保障了。
 


所以我们应该设计一个更新刷新令牌的接口，当访问令牌过期的时候返回特定的错误码给前端，前端再调用这个接口进行刷新，先安全存储再本地，再拿着这个新的令牌去调用刚才的接口，就可以获取新的双令牌。
 


如果攻击者想要发起恶意攻击，必须要窃取两个才行，攻击的成本就大大增加了。
 


新方案如下：
 


![](https://i-blog.csdnimg.cn/direct/a433a07196f64c4aad11b7295eeff278.png)
 


这里我们取消了原本的两个错误状态码返回，因为不符合语义和规范，改为增加类型字段即可，然后又添加了一种异常场景。
 


首先解析令牌出错的话只能是恶意攻击的伪造令牌，所以这里直接驳回请求并清空本地存储。
 


其次访问令牌无效则是有两种情况，一是令牌解析出错，密钥错误或者格式不对；二是过期了，所以针对过期我们让客户端重路由调用更新刷新令牌的接口返回新令牌即可。
 


最后是拉黑，这个很简单，被拉黑的访问令牌一般就是用户已经进行了登出操作，这个时候就只能让用户重新登录。
 


---
 


## 三、具体实现
 


### （一）JWT 工具类
 


```java
@Slf4j
@Component
@Data
@Resource
public class JwtTokenProvider {
 
    private final JwtProperties jwtProperties;
 
    // 安全密钥生成
    private byte[] getSigningKeyBytes() {
        return jwtProperties.getUserSecretKey().getBytes(StandardCharsets.UTF_8);
    }
 
    // 生成访问令牌
    public String generateToken(Map<String, Object> claims, String tokenVersion) {
        return buildToken(claims, tokenVersion, jwtProperties.getAccessExpiration(), TokenTypeConstant.ACCESS);
    }
 
    // 生成刷新令牌
    public String generateRefreshToken(Map<String, Object> claims, String tokenVersion) {
        return buildToken(claims, tokenVersion, jwtProperties.getRefreshExpiration(), TokenTypeConstant.REFRESH);
    }
 
    // 构建JWT令牌
    private String buildToken(Map<String, Object> claims, String tokenVersion, long expirationMillis, String tokenType) {
        // 生成jti唯一标识
        String jti = UUID.randomUUID().toString();
        // 获取当前时间戳
        long now = System.currentTimeMillis();
 
        Map<String, Object> merged = new HashMap<>();
        if (claims != null){
            merged.putAll(claims);
        }
        merged.put(Claims.ID, jti);
        merged.put(TOKEN_VERSION, tokenVersion);
        merged.put(TOKEN_TYPE, tokenType);
 
        return Jwts.builder()
                // 绑定jit唯一标识、用户ID、令牌版本号、令牌类型
                .setClaims(merged)
                // 设置令牌生成时间
                .setIssuedAt(new Date(now))
                // 设置令牌过期时间
                .setExpiration(new Date(now + expirationMillis))
                // 签名仿伪造
                .signWith(SignatureAlgorithm.HS512, getSigningKeyBytes())
                .compact();
    }
 
    // 解析令牌
    private Jws<Claims> parseJws(String token) {
        return Jwts.parser()
                .setSigningKey(getSigningKeyBytes())
                .parseClaimsJws(token);
    }
 
    // 解析访问令牌
    public Claims parseToken(String token) {
        // 解析
        Jws<Claims> jws = parseJws(token);
        // 查看类型是否匹配
        if (!TokenTypeConstant.ACCESS.equals(jws.getBody().get(TOKEN_TYPE, String.class))) {
            throw new BaseException("访问令牌类型不匹配");
        }
        return jws.getBody();
    }
 
    // 解析刷新令牌
    public Claims parseRefreshToken(String refreshToken) {
        // 解析
        Jws<Claims> jws = parseJws(refreshToken);
        // 查看类型是否匹配
        if (!TokenTypeConstant.REFRESH.equals(jws.getBody().get(TOKEN_TYPE, String.class))) {
            throw new BaseException("刷新令牌类型不匹配");
        }
        return jws.getBody();
    }
 
    // 访问令牌验证方法
    public Claims validateToken(String token) {
        try {
            return parseToken(token);
        } catch (BaseException e){
         throw new JwtException(e.getMessage());
        } catch (JwtException | IllegalArgumentException ex) {
            log.error("令牌验证失败：{}", ex.getMessage());
            return null;
        }
    }
 
    // 刷新令牌验证方法
    public boolean validateRefreshToken(String refreshToken) {
        try {
            parseRefreshToken(refreshToken);
            return true;
        } catch (BaseException e){
            throw new JwtException(e.getMessage());
        } catch (JwtException | IllegalArgumentException ex) {
            log.error("令牌验证失败：{}", ex.getMessage());
            return false;
        }
    }
 
    // 检查是否需要刷新
    public boolean shouldRefreshAccessToken(String token) {
        // 获取剩余有效时间
        long remaining = getRemainingTime(token);
        // 如果小于阈值就刷新
        return remaining < jwtProperties.getRefreshThreshold();
    }
 
    // 获取剩余有效时间（毫秒）
    public long getRemainingTime(String token) {
        // 解析
        Jws<Claims> jws = parseJws(token);
        return jws.getBody().getExpiration().getTime() - System.currentTimeMillis();
    }
 
    // 从访问令牌获取JTI唯一标识
    public String getJtiFromToken(String token) {
        return parseToken(token).getId();
    }
 
    // 从刷新令牌获取JTI唯一标识
    public String getJtiFromRefreshToken(String refreshToken) {
        return parseRefreshToken(refreshToken).getId();
    }
 
    public long getRefreshExpiration() {
        return jwtProperties.getRefreshExpiration();
    }
}
```
 


主要负责令牌的创建、解析与校验。
 


这个逻辑很简单，就不做赘述了。
 


### （二）Redis 令牌管理
 


```java
     // DTO返回结果
    @Data
    @AllArgsConstructor
    public class RefreshResult {
        private String accessToken;
        private String refreshToken;
    }
```
 


```java
@Service
@RequiredArgsConstructor
public class RedisTokenSessionService {
    private final JwtTokenProvider tokenProvider;
    private final StringRedisTemplate stringRedisTemplate;
    private final RedissonClient redissonClient;
 
    private static final DefaultRedisScript<Long> LIMIT_FLOW_SCRIPT;
    static {
        LIMIT_FLOW_SCRIPT = new DefaultRedisScript<>();
        LIMIT_FLOW_SCRIPT.setLocation(new ClassPathResource("lua/limit_flow.lua"));
        LIMIT_FLOW_SCRIPT.setResultType(Long.class);
    }
 
    // 创建新会话
    public String createNewSession(Long userId, long ttlMillis) {
        // 创建新Token版本号
        String newTokenVersion = UUID.randomUUID().toString();
        // 存储刷新令牌和版本号的映射关系
        String refreshKey = String.format(REFRESH_TOKEN_PREFIX, userId);
        // 会覆盖掉旧的会话版本号，也就是禁止多点登录
        stringRedisTemplate.opsForValue().set(refreshKey, newTokenVersion, ttlMillis, TimeUnit.MILLISECONDS);
        return newTokenVersion;
    }
 
    // 刷新令牌状态
    public RefreshResult refreshTokenState(String refreshToken) {
        // 解析刷新令牌
        Claims claims = tokenProvider.parseRefreshToken(refreshToken);
        // 获取绑定的用户ID
        Long userId = Long.valueOf(String.valueOf(claims.get(JwtClaimsConstant.USER_ID)));
 
        // 校验会话是否有效
        String tokenVersion = claims.get(TOKEN_VERSION, String.class);
        if (!isValidToken(userId, tokenVersion)) {
            throw new BaseException("刷新令牌已失效，请重新登录");
        }
        
        // 分布式锁防止并发刷新
        RLock lock = redissonClient.getLock(String.format(TOKEN_LOCK, userId));
        if (!lock.tryLock()) {
            throw new BaseException("刷新操作进行中");
        }
        
        try {
            /*
                检查刷新次数，防止恶意攻击
             */
            // 获取唯一标识
            String jti = claims.getId();
            // 针对当前刷新令牌的唯一标识，创建一个计数器
            String countKey = String.format(REFRESH_COUNT_PREFIX, jti);
            // ttl为1h
            long timeMillis = 60 * 1000 * 5;
            // 执行 Lua 脚本
            Long refreshCount = stringRedisTemplate.execute(
                    LIMIT_FLOW_SCRIPT,
                    Collections.singletonList(countKey),
                    String.valueOf(timeMillis)
            );
            // 五分钟内最多刷新一次
            if (refreshCount != null && refreshCount > 1) {
                // 直接吊销刷新令牌强制用户重新登录
                revokeRefreshToken(userId);
                throw new BaseException("刷新频率异常");
            }
            
            /*
                生成新会话
             */
            String newTokenVersion = UUID.randomUUID().toString();
            String refreshKey = String.format(REFRESH_TOKEN_PREFIX, userId);
            stringRedisTemplate.opsForValue().set(refreshKey, newTokenVersion, 1, TimeUnit.DAYS);
 
 
            /*
                生成新双令牌
             */
            Map<String, Object> newClaims = new HashMap<>();
            newClaims.put(JwtClaimsConstant.USER_ID, userId);
            String newAccessToken = tokenProvider.generateToken(newClaims, newTokenVersion);
            String newRefreshToken = tokenProvider.generateRefreshToken(newClaims, newTokenVersion);
            
            // 将旧刷新令牌加入黑名单，拒绝其访问
            long ttl = tokenProvider.getRemainingTime(refreshToken);
            addToShortBlacklist(jti, ttl);
 
            // 返回双令牌
            return new RefreshResult(newAccessToken, newRefreshToken);
        } finally {
            lock.unlock();
        }
    }
 
    // 验证当前用户会话是否有效
    public boolean isValidToken(Long userId, String tokenVersion) {
        String refreshKey = String.format(REFRESH_TOKEN_PREFIX, userId);
        // 获取当前用户会话版本号
        String storedVersion = stringRedisTemplate.opsForValue().get(refreshKey);
        if(storedVersion == null){
            // 当前会话已过期，让用户自行重新登录
            return false;
        }
        // 校验令牌携带版本号与会话版本号是否相同
        return tokenVersion.equals(storedVersion);
    }
 
    // 吊销刷新令牌
    public void revokeRefreshToken(Long userId) {
        String refreshKey = String.format(REFRESH_TOKEN_PREFIX, userId);
        // 直接删除会话版本号，强制用户重新登陆创建新会话
        stringRedisTemplate.delete(refreshKey);
    }
 
    // 加入短期黑名单
    public void addToShortBlacklist(String jti, long ttlMillis) {
        if (ttlMillis > 0) {
            // 将jti拉黑，使双令牌都无法访问，ttl为剩余过期时间
            stringRedisTemplate.opsForValue().set(
                String.format(SHORT_BLACKLIST_PREFIX, jti),
                "1", 
                ttlMillis, TimeUnit.MILLISECONDS
            );
        }
    }
 
    // 检查是否在黑名单中
    public boolean isJtiBlacklisted(String jti) {
        return Boolean.TRUE.equals(stringRedisTemplate.hasKey(String.format(SHORT_BLACKLIST_PREFIX, jti)));
    }
}
```
 


主要负责令牌的管理。
 


对 redis 我们分了两个集合来管理，一个是存储所有的会话版本号，还有一个是存储吊销的 JIT。
 


然后刷新刷新令牌的这个方法，我们用了分布式锁，因为要预防有人恶意频繁调用更新刷新令牌的接口来触发这个方法进行攻击（旧令牌频繁插入 redis 导致触发缓存淘汰策略并且占用其他 redis 命令任务的执行线程），所以我们在加锁的基础上又引入了一个计数器，保证 5min 内只能刷新 1 次。
 


在生成完新的双令牌之后也要记得把旧的刷新令牌拉入黑名单。
 


> 
>  为什么访问令牌不拉黑？ 
>  别忘了，这个接口的触发时机是访问令牌过期。 
> 
 


### （三）JWT 全局过滤器
 


```java
package com.quick.interceptor;
 
@Component
@RequiredArgsConstructor
public class JwtAuthenticationInterceptor implements HandlerInterceptor {
    private final JwtTokenProvider tokenProvider;
    private final RedisTokenSessionService tokenSessionService;
    private final JwtProperties jwtProperties;
 
    @Override
    public boolean preHandle(@Nullable HttpServletRequest request, @Nullable HttpServletResponse response, @Nullable Object handler) throws Exception {
 
        //判断当前拦截到的是Controller的方法还是其他资源
        if (!(handler instanceof HandlerMethod)) {
            //当前拦截到的不是动态方法，直接放行
            return true;
        }
 
        try {
            // 拿到当前访问令牌
            String accessToken = request.getHeader(jwtProperties.getUserTokenName());
            if (accessToken != null) {
                // 验证访问令牌是否有效
                Claims claims = tokenProvider.validateToken(accessToken);
                if (claims != null) {
                    // 获取JTI并检查短期黑名单
                    String jti = claims.getId();
                    if (jti == null || tokenSessionService.isJtiBlacklisted(jti)) {
                        // 使用失效token，不予通过
                        throw new AuthenticationException("当前访问令牌已失效");
                    }
 
                    // 解析访问令牌
                    tokenProvider.parseToken(accessToken);
                    Long userId = Long.valueOf(claims.get(JwtClaimsConstant.USER_ID).toString());
                    // 获取当前会话版本号
                    String tokenVersion = claims.get(TOKEN_VERSION, String.class);
 
                    // 验证当前用户会话是否有效
                    if (tokenSessionService.isValidToken(userId, tokenVersion)) {
                        // 绑定用户ID到当前线程上下文
                        BaseContext.setCurrentId(userId);
 
                        // 检查访问令牌是否需要刷新
                        if (tokenProvider.shouldRefreshAccessToken(accessToken)) {
                            // 生成新的访问令牌
                            Map<String, Object> newClaims = new HashMap<>();
                            newClaims.put(JwtClaimsConstant.USER_ID, userId);
                            String newToken = tokenProvider.generateToken(newClaims, tokenVersion);
                            // 绑定到响应头上，返回给前端进行存储
                            response.setHeader("X-New-Access-Token", newToken);
 
                            // 将旧访问令牌加入短期黑名单
                            long ttl = tokenProvider.getRemainingTime(accessToken);
                            tokenSessionService.addToShortBlacklist(jti, ttl);
                        }
                    } else {
                        // 当前校验的用户会话与有效的用户会话版本号不一致，证明当前token并非过期而是无效的
                        throw new AuthenticationException("当前会话无效");
                    }
                } else {
                    // 访问令牌过期后刷新刷新令牌并返回新的访问令牌
                    throw new BadCredentialsException("当前访问令牌已过期");
                }
            }else{
                throw new AuthenticationException("访问令牌无效");
            }
        } catch (BadCredentialsException ex) {
            // 访问令牌过期或不可用 —— 前端应调用刷新接口
            handleAuthenticationError(response, "ACCESS_TOKEN_EXPIRED", ex.getMessage(), HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        } catch (AuthenticationException ex) {
            // 其它认证异常（会话无效、未登录等） —— 前端应跳转登录
            handleAuthenticationError(response, "AUTH_INVALID", ex.getMessage(), HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        } catch (JwtException ex) {
            // 解析/token 签名错误等 —— 前端应清理本地存储
            handleAuthenticationError(response, "TOKEN_INVALID", ex.getMessage(), HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }
        // 放行
        return true;
    }
 
     // 统一处理认证错误
     private void handleAuthenticationError(HttpServletResponse response, String error, String message, int statusCode) throws IOException {
         // 清除线程上下文
         BaseContext.removeCurrentId();
 
         response.setStatus(statusCode);
         response.setContentType(MediaType.APPLICATION_JSON_VALUE);
         response.setCharacterEncoding("UTF-8");
 
         long timestamp = System.currentTimeMillis();
 
         // 简单的 JSON 字符串转义，避免 message 中有引号或换行导致返回格式错乱
         String safeError = escapeJson(error);
         String safeMessage = escapeJson(message);
 
         String jsonResponse = String.format(
                 "{\"status\": %d, \"error\": \"%s\", \"message\": \"%s\", \"timestamp\": %d}",
                 statusCode, safeError, safeMessage, timestamp
         );
 
         response.getWriter().write(jsonResponse);
     }
 
    private String escapeJson(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            switch (ch) {
                case '\\': sb.append("\\\\"); break;
                case '"':  sb.append("\\\""); break;
                case '\b': sb.append("\\b");  break;
                case '\f': sb.append("\\f");  break;
                case '\n': sb.append("\\n");  break;
                case '\r': sb.append("\\r");  break;
                case '\t': sb.append("\\t");  break;
                default:
                    if (ch <= 0x1F) {
                        sb.append(String.format("\\u%04x", (int) ch));
                    } else {
                        sb.append(ch);
                    }
            }
        }
        return sb.toString();
    }
}
```
 


这里是本方案的核心流程的实现。
 


### （四）业务层代码
 


```java
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public class UserLoginResponse {
        private Long userId;
        private String accessToken;
        private String refreshToken;
        private long accessExpiresIn;
        private long refreshExpiresIn;
    }
```
 


```java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final TokenSessionService tokenSessionService;
    private final JwtTokenProvider tokenProvider;
 
    // 登录
    @PostMapping("/login")
    public UserLoginResponse login(User user) {
        // MySQL用户认证逻辑，这里省略
        
        
        // 创建JWT声明
        Map<String, Object> claims = new HashMap<>();
        claims.put(JwtClaimsConstant.USER_ID, user.getId());
 
        // 吊销旧的刷新令牌
        tokenSessionService.revokeRefreshToken(user.getId());
 
        // 创建新用户会话版本号
        String tokenVersion = tokenSessionService.createNewSession(user.getId(), jwtProperties.getSessionExpiration());
 
        // 生成双令牌
        String accessToken = jwtTokenProvider.generateToken(claims, tokenVersion);
        String refreshToken = jwtTokenProvider.generateRefreshToken(claims, tokenVersion);
 
        // 构建响应
        UserLoginResponse response = new UserLoginResponse(
                user.getId(),
                accessToken,
                refreshToken,
                jwtTokenProvider.getRemainingTime(accessToken) / 1000,
                jwtTokenProvider.getRefreshExpiration() / 1000
        );
 
        // 保存刷新令牌
        UserToken userToken = new UserToken();
        userToken.setUserId(user.getId());
        userToken.setToken(refreshToken);
 
        // 查询是否已存在用户令牌记录
        LambdaQueryWrapper<UserToken> queryWrapper = Wrappers.lambdaQuery(UserToken.class).eq(UserToken::getUserId, user.getId());
        UserToken existingUserToken = userTokenMapper.selectOne(queryWrapper);
        if (existingUserToken == null) {
            // 如果不存在，则插入新记录
            userTokenMapper.insert(userToken);
        } else {
            // 如果已存在，则更新令牌
            existingUserToken.setToken(refreshToken);
            userTokenMapper.updateById(existingUserToken);
        }
        return response;
    }
 
    // 刷新刷新令牌
    @PostMapping("/refresh-token")
    public UserLoginResponse refreshToken(String refreshToken, HttpServletRequest request) {
        // 解析刷新令牌
        Claims incomingClaims;
        try {
            incomingClaims = jwtTokenProvider.parseRefreshToken(refreshToken);
        } catch (JwtException ex) {
            throw new BaseException("刷新令牌无效或已过期");
        }
 
        Long userId = Long.valueOf(incomingClaims.get(JwtClaimsConstant.USER_ID).toString());
        String incomingJti = incomingClaims.getId();
        long remainingMs = incomingClaims.getExpiration().getTime() - System.currentTimeMillis();
        if (remainingMs < 0) {
            throw new BaseException("刷新令牌已过期");
        }
 
        // 查看当前刷新令牌是否被拉黑
        if (tokenSessionService.isJtiBlacklisted(incomingJti)) {
            throw new BaseException("当前刷新令牌已被拉黑");
        }
 
        // 获取DB存储的旧令牌，比对是否一致
        LambdaQueryWrapper<UserToken> userTokenLambdaQueryWrapper = Wrappers.lambdaQuery(UserToken.class)
                .eq(UserToken::getToken, refreshToken);
        UserToken userTokenDo = userTokenMapper.selectOne(userTokenLambdaQueryWrapper);
        if(userTokenDo == null){
            throw new BaseException("当前刷新令牌已无效");
            // 此处我忘记做缓存穿透的防御了，请各位同学自行添加相关逻辑
        }
 
        // 比对
        if (!userTokenDo.getToken().equals(refreshToken)) {
            throw new BaseException("当前刷新令牌已无效");
        }
 
        // 刷新令牌（返回新双令牌）
        RefreshResult result = tokenSessionService.refreshTokenState(refreshToken);
 
        // 解析新访问令牌信息
        Claims accessClaims = jwtTokenProvider.parseToken(result.getAccessToken());
 
        // 把新刷新令牌回写入DB
        LambdaUpdateWrapper<UserToken> updateWrapper = Wrappers.lambdaUpdate(UserToken.class)
                .eq(UserToken::getUserId, userId);
        userTokenDo.setToken(result.getRefreshToken());
        int update = userTokenMapper.update(userTokenDo, updateWrapper);
        if (!SqlHelper.retBool(update)) {
            throw new BaseException("刷新失败，请重新登录！");
        }
 
        // 将旧刷新令牌的jti加入短期黑名单，防止同一旧令牌被重放
        if (remainingMs > 0) {
            tokenSessionService.addToShortBlacklist(incomingJti, remainingMs);
        }
 
        // 构建响应
        UserLoginResponse response = new UserLoginResponse(
                userId,
                null,
                result.getAccessToken(),
                result.getRefreshToken(),
                (accessClaims.getExpiration().getTime() - System.currentTimeMillis()) / 1000,
                jwtTokenProvider.getRefreshExpiration()
        );
 
        return response;
    }
 
    // 登出
    @PostMapping("/logout")
    public void logout(HttpServletRequest request) {
        // 获取访问令牌
        String accessToken = request.getHeader(jwtProperties.getUserTokenName());
        if (accessToken == null) {
            BaseContext.removeCurrentId();
            return;
        }
 
        try {
            // 解析访问令牌
            Claims accessClaims = jwtTokenProvider.parseToken(accessToken);
            Long userId = Long.valueOf(accessClaims.get(JwtClaimsConstant.USER_ID).toString());
 
            // 删除DB中的刷新令牌
            LambdaQueryWrapper<UserToken> userTokenLambdaQueryWrapper = Wrappers.lambdaQuery(UserToken.class)
                    .eq(UserToken::getUserId, userId);
            int delete = userTokenMapper.delete(userTokenLambdaQueryWrapper);
            if (!SqlHelper.retBool(delete)) {
                throw new JwtException("登出失败！请重试！");
            }
 
            // 吊销会话
            tokenSessionService.revokeRefreshToken(userId);
 
            // 将当前访问令牌的jti加入短期黑名单
            String accessJti = accessClaims.getId();
            long accessTtl = jwtTokenProvider.getRemainingTime(accessToken);
            if (accessTtl > 0) {
                tokenSessionService.addToShortBlacklist(accessJti, accessTtl);
            }
        } catch (JwtException ex) {
            throw new BaseException("登出失败！请重试！");
        } finally {
            BaseContext.removeCurrentId();
        }
    }
}
```
 


这里就是业务代码了，这里其实就是调各种 api，也比较简单，注释说明得也很明确了。
 


在登录接口中需要在生成新的令牌之前将旧的刷新令牌吊销，目的是实现单点互斥登录，之所以不需要把访问令牌也吊销，一是做不到，我们拿不到旧的访问令牌；二是没必要，我们预防的只是叠加登录，如果旧的刷新令牌被吊销的话对方在下一次调用 api 的时候在校验会话是否有效环节就会被驳回请求返回 401 错误码要求其重新登录。
 


如果想实现不同端同时登陆的话，比如说电脑端和手机端同时登录，可以将 redis 的存活名单、黑名单等这些结构改成，hash 的字段名则对应 pc 或 pe，接着后续的操作与结构无异，无非是在认证的过程多了一步判断当前设备的类型罢了。
 


---
 


## 四、补充
 


虽说窃取两个令牌的成本很大，但是只要两个令牌可能被窃取，用户安全就有风险。
 


所以一般我们还会引入一个设备标识码，在前端发起请求时携带在请求头中，每台设备唯一，将其作为令牌的一个属性。
 


这样的话即使攻击者窃取到了两个令牌，也会在解析令牌的时候因为设备标识码不同而被驳回请求。
 


---
 


**~码文不易，留个赞再走吧~**

---
> 原文链接: [基于 MySQL + Redis + JWT 的双令牌认证方案的实现](https://blog.csdn.net/2401_88959292/article/details/150224992?spm=1001.2014.3001.5501)
> 作者: Yilena
