package org.yearup.data.mysql;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.yearup.data.ShoppingCartDao;
import org.yearup.models.Product;
import org.yearup.models.ShoppingCart;
import org.yearup.models.ShoppingCartItem;
import org.yearup.models.User;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.*;

@Component
public class MySqlShoppingCartDao extends MySqlDaoBase implements ShoppingCartDao {

    @Autowired
    public MySqlShoppingCartDao(DataSource dataSource) {
        super(dataSource);
    }

    @Override
    public ShoppingCart getCartByUserId(int userId) {
        ShoppingCart cart = new ShoppingCart();
        String sql = """
                select * from shopping_cart
                join products using (product_id)
                where user_id = ?;
                """;
        try (
                Connection connection = super.getConnection();
                PreparedStatement preparedStatement = connection.prepareStatement(sql);
        ) {
            preparedStatement.setInt(1, userId);
            ResultSet resultSet = preparedStatement.executeQuery();
            while (resultSet.next()) {
                ShoppingCartItem item = new ShoppingCartItem();
                item.setProduct(mapRow(resultSet));
                cart.add(item);
            }
            return cart;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public ShoppingCart addProduct(ShoppingCartItem item, User user) {
        String sql = """
                insert into shopping_cart (user_id, product_id, quantity)
                values (?,?,?);
                """;
        try (
                Connection connection = super.getConnection();
                PreparedStatement preparedStatement = connection.prepareStatement(sql);
        ) {
            preparedStatement.setInt(1, user.getId());
            preparedStatement.setInt(2, item.getProductId());
            preparedStatement.setInt(3, item.getQuantity());
            int rowsAdded = preparedStatement.executeUpdate();
            if(rowsAdded > 0) {
                return getCartByUserId(user.getId());
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    // NEED TO FIX - cant update cart and causes error
    @Override
    public ShoppingCart updateProductQuantity(ShoppingCartItem item, User user) {
        String sql = """
                update shopping_cart
                set quantity = ?
                where product_Id = ?;
                """;
        int quantity = item.getQuantity() + 1;
        try(
                Connection connection = super.getConnection();
                PreparedStatement preparedStatement = connection.prepareStatement(sql);
        ) {
            preparedStatement.setInt(1, quantity);
            preparedStatement.setInt(2, user.getId());
            int rowsAdded = preparedStatement.executeUpdate();
            if(rowsAdded > 0) {
                return getCartByUserId(user.getId());
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    protected static Product mapRow(ResultSet row) throws SQLException {
        int productId = row.getInt("product_id");
        String name = row.getString("name");
        BigDecimal price = row.getBigDecimal("price");
        int categoryId = row.getInt("category_id");
        String description = row.getString("description");
        String subCategory = row.getString("subcategory");
        int stock = row.getInt("stock");
        boolean isFeatured = row.getBoolean("featured");
        String imageUrl = row.getString("image_url");

        return new Product(productId, name, price, categoryId, description, subCategory, stock, isFeatured, imageUrl);
    }
}

