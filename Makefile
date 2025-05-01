all:
	make images
	make up

dev:
	cd backend && npm run dev & \
	cd frontend && npm run dev

images:
	docker-compose -f ./docker-compose.yml build

up:
	docker compose -f ./docker-compose.yml up


down:
	docker compose -f ./docker-compose.yml down

# ssl:
# 	mkdir -p frontend/ssh
# 	@if [ ! -f frontend/ssh/id_rsa ] || [ ! -f frontend/ssh/id_rsa.pub ]; then \
# 		echo "🔐 Creating SSL key and public key..."; \
# 		ssh-keygen -t rsa -b 4096 -f frontend/ssh/id_rsa -N ""; \
# 	else \
# 		echo "✅ SSL certificate and key already exist. Skipping generation."; \
# 	fi


clean: 
	docker compose -f ./docker-compose.yml down --rmi all -v

fclean: clean
	docker system prune -f --volumes

re: fclean all

.PHONY: all clean fclean re up down dev images